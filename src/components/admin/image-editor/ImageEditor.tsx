import { useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, RotateCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  AJUSTEMENT_INITIAL,
  deplacerRogne,
  dimensionsOrientees,
  emplacementImage,
  estAjustementInitial,
  rectangleRogne,
  rogneInitiale,
  rogneRedimensionnee,
  tailleExportRogne,
  type AjustementImage,
  type CoinRogne,
  type EmplacementImage,
} from "./cadre-page";

type ResultatImage =
  | { inchange: true; emplacement: EmplacementImage }
  | { inchange: false; fichier: File; emplacement: EmplacementImage };

const EMPLACEMENTS: { id: EmplacementImage; label: string }[] = [
  { id: "gauche", label: "Gauche" },
  { id: "centre", label: "Centre" },
  { id: "droite", label: "Droite" },
  { id: "pleine", label: "Pleine largeur" },
];

interface ImageEditorProps {
  ouvert: boolean;
  /** URL blob ou URL déjà stockée. */
  source: string;
  nom: string;
  emplacementInitial?: EmplacementImage;
  onAnnuler: () => void;
  onValider: (resultat: ResultatImage) => void;
}

function placementImage(
  stageW: number,
  stageH: number,
  imgW: number,
  imgH: number,
  ajustement: AjustementImage,
) {
  const { ow, oh } = dimensionsOrientees(imgW, imgH, ajustement.rotation);
  const contain = ow > 0 && oh > 0 ? Math.min(stageW / ow, stageH / oh) : 1;
  const w = ow * contain * ajustement.zoom;
  const h = oh * contain * ajustement.zoom;
  return {
    x: (stageW - w) / 2 + ajustement.offsetX,
    y: (stageH - h) / 2 + ajustement.offsetY,
    w,
    h,
  };
}

function rotationSuivante(rotation: AjustementImage["rotation"], sens: 1 | -1): AjustementImage["rotation"] {
  const ordre: AjustementImage["rotation"][] = [0, 90, 180, 270];
  const index = ordre.indexOf(rotation);
  return ordre[(index + sens + 4) % 4];
}

export function ImageEditor({
  ouvert,
  source,
  nom,
  emplacementInitial = "pleine",
  onAnnuler,
  onValider,
}: ImageEditorProps) {
  const cadreRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const glisser = useRef<
    | { type: "move" | "pan"; x: number; y: number; rogne: AjustementImage["rogne"]; ox: number; oy: number }
    | { type: "resize"; coin: CoinRogne; x: number; y: number; rogne: AjustementImage["rogne"] }
    | null
  >(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ajustement, setAjustement] = useState<AjustementImage>(AJUSTEMENT_INITIAL);
  const [emplacement, setEmplacement] = useState<EmplacementImage>(emplacementInitial);
  const [tailleCadre, setTailleCadre] = useState({ w: 0, h: 0 });
  const [exportEnCours, setExportEnCours] = useState(false);

  useEffect(() => {
    if (!ouvert) return;
    setAjustement(AJUSTEMENT_INITIAL);
    setEmplacement(emplacementImage(emplacementInitial));
    setErreur(null);
    setImage(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setAjustement({
        ...AJUSTEMENT_INITIAL,
        rogne: rogneInitiale(img.naturalWidth, img.naturalHeight, 0),
      });
      setImage(img);
    };
    img.onerror = () => setErreur("Impossible de charger cette image.");
    img.src = source;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [ouvert, source, emplacementInitial]);

  useEffect(() => {
    const cadre = cadreRef.current;
    if (!cadre || !ouvert) return;
    const observer = new ResizeObserver(() => {
      const rect = cadre.getBoundingClientRect();
      setTailleCadre({ w: rect.width, h: rect.height });
    });
    observer.observe(cadre);
    return () => observer.disconnect();
  }, [ouvert, image]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || tailleCadre.w < 2 || tailleCadre.h < 2) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(tailleCadre.w * dpr);
    canvas.height = Math.round(tailleCadre.h * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, tailleCadre.w, tailleCadre.h);
    const place = placementImage(tailleCadre.w, tailleCadre.h, img.naturalWidth, img.naturalHeight, ajustement);
    ctx.save();
    ctx.translate(place.x + place.w / 2, place.y + place.h / 2);
    ctx.rotate((ajustement.rotation * Math.PI) / 180);
    const tourne = ajustement.rotation % 180 !== 0;
    const drawW = tourne ? place.h : place.w;
    const drawH = tourne ? place.w : place.h;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [ajustement, tailleCadre, image]);

  const place = image
    ? placementImage(tailleCadre.w, tailleCadre.h, image.naturalWidth, image.naturalHeight, ajustement)
    : null;
  const selection = place
    ? {
        left: place.x + ajustement.rogne.x * place.w,
        top: place.y + ajustement.rogne.y * place.h,
        width: ajustement.rogne.w * place.w,
        height: ajustement.rogne.h * place.h,
      }
    : null;

  const appliquer = (partiel: Partial<AjustementImage>) => {
    setAjustement((actuel) => ({ ...actuel, ...partiel }));
  };

  const fractionDepuisPixels = (dx: number, dy: number) => {
    if (!place || place.w < 1 || place.h < 1) return { dx: 0, dy: 0 };
    return { dx: dx / place.w, dy: dy / place.h };
  };

  const exporter = async () => {
    const img = imageRef.current;
    if (!img || tailleCadre.w < 2) return;
    if (estAjustementInitial(ajustement, img.naturalWidth, img.naturalHeight)) {
      onValider({ inchange: true, emplacement });
      return;
    }

    setExportEnCours(true);
    try {
      const { ow, oh, sx, sy, sw, sh } = rectangleRogne(
        img.naturalWidth,
        img.naturalHeight,
        ajustement.rotation,
        ajustement.rogne,
      );
      const { width, height } = tailleExportRogne(sw, sh);
      const oriente = document.createElement("canvas");
      oriente.width = Math.max(1, Math.round(ow));
      oriente.height = Math.max(1, Math.round(oh));
      const octx = oriente.getContext("2d");
      if (!octx) throw new Error("Export impossible");
      octx.translate(oriente.width / 2, oriente.height / 2);
      octx.rotate((ajustement.rotation * Math.PI) / 180);
      octx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2, img.naturalWidth, img.naturalHeight);

      const sortie = document.createElement("canvas");
      sortie.width = width;
      sortie.height = height;
      const ctx = sortie.getContext("2d");
      if (!ctx) throw new Error("Export impossible");
      const png = /\.png$/i.test(nom) || source.startsWith("data:image/png");
      if (!png) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(oriente, sx, sy, sw, sh, 0, 0, width, height);

      const type = png ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => {
        sortie.toBlob(resolve, type, 0.92);
      });
      if (!blob) throw new Error("Export impossible");
      const base = nom.replace(/\.[^.]+$/, "") || "page";
      const fichier = new File([blob], `${base}.${png ? "png" : "jpg"}`, { type });
      onValider({ inchange: false, fichier, emplacement });
    } catch {
      setExportEnCours(false);
      setErreur("Impossible de produire l'image. Si elle vient d'un autre site, réimportez le fichier.");
    }
  };

  return (
    <Dialog open={ouvert} onOpenChange={(open) => { if (!open && !exportEnCours) onAnnuler(); }}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajuster l'image</DialogTitle>
          <DialogDescription>
            Faites glisser le cadre pour rogner, puis choisissez où l'image se place dans la page.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={cadreRef}
          className="relative mx-auto h-80 w-full max-w-md touch-none overflow-hidden rounded-lg border border-border bg-muted"
          onPointerDown={(event) => {
            if (!image || (event.target as HTMLElement).dataset.rogne) return;
            (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
            glisser.current = {
              type: "pan",
              x: event.clientX,
              y: event.clientY,
              rogne: ajustement.rogne,
              ox: ajustement.offsetX,
              oy: ajustement.offsetY,
            };
          }}
          onPointerMove={(event) => {
            const depart = glisser.current;
            const img = imageRef.current;
            if (!depart || !img || !place) return;
            if (depart.type === "pan") {
              appliquer({
                offsetX: depart.ox + (event.clientX - depart.x),
                offsetY: depart.oy + (event.clientY - depart.y),
              });
              return;
            }
            const { dx, dy } = fractionDepuisPixels(event.clientX - depart.x, event.clientY - depart.y);
            const { ow, oh } = dimensionsOrientees(img.naturalWidth, img.naturalHeight, ajustement.rotation);
            if (depart.type === "move") {
              appliquer({ rogne: deplacerRogne(depart.rogne, dx, dy) });
              return;
            }
            appliquer({ rogne: rogneRedimensionnee(depart.rogne, depart.coin, dx, dy, ow, oh) });
          }}
          onPointerUp={() => {
            glisser.current = null;
          }}
          onPointerCancel={() => {
            glisser.current = null;
          }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          {selection ? (
            <div
              data-rogne="cadre"
              className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
              style={{
                left: selection.left,
                top: selection.top,
                width: selection.width,
                height: selection.height,
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                (cadreRef.current as HTMLDivElement).setPointerCapture(event.pointerId);
                glisser.current = {
                  type: "move",
                  x: event.clientX,
                  y: event.clientY,
                  rogne: ajustement.rogne,
                  ox: 0,
                  oy: 0,
                };
              }}
            >
              {(["nw", "ne", "sw", "se"] as const).map((coin) => (
                <span
                  key={coin}
                  data-rogne="coin"
                  className={`absolute size-4 rounded-sm border border-white bg-primary ${
                    coin.includes("n") ? "-top-2" : "-bottom-2"
                  } ${coin.includes("w") ? "-left-2" : "-right-2"} ${
                    coin === "nw" || coin === "se" ? "cursor-nwse-resize" : "cursor-nesw-resize"
                  }`}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    (cadreRef.current as HTMLDivElement).setPointerCapture(event.pointerId);
                    glisser.current = {
                      type: "resize",
                      coin,
                      x: event.clientX,
                      y: event.clientY,
                      rogne: ajustement.rogne,
                    };
                  }}
                />
              ))}
            </div>
          ) : null}
          {!image && !erreur ? (
            <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Chargement…</p>
          ) : null}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          La zone claire est conservée. Faites glisser le cadre ou ses coins pour rogner.
        </p>

        <div className="space-y-2">
          <p className="text-sm font-medium">Emplacement dans la page</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {EMPLACEMENTS.map((choix) => {
              const actif = emplacement === choix.id;
              return (
                <button
                  key={choix.id}
                  type="button"
                  aria-pressed={actif}
                  className={`min-h-11 rounded-lg border px-2 text-sm ${
                    actif
                      ? "border-primary bg-primary/10 font-medium text-foreground"
                      : "border-border hover:bg-secondary"
                  }`}
                  onClick={() => setEmplacement(choix.id)}
                >
                  {choix.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {emplacement === "gauche"
              ? "L'image se place à gauche, le texte continue à côté."
              : emplacement === "droite"
                ? "L'image se place à droite, le texte continue à côté."
                : emplacement === "centre"
                  ? "L'image se place au centre de la page."
                  : "L'image occupe toute la largeur de la page."}
          </p>
        </div>

        {erreur ? <p className="text-sm text-destructive">{erreur}</p> : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Zoom</span>
            <span className="text-muted-foreground">{Math.round(ajustement.zoom * 100)} %</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid size-11 shrink-0 place-items-center rounded-lg border border-border hover:bg-secondary"
              aria-label="Zoom moins"
              onClick={() => appliquer({ zoom: Math.max(1, Number((ajustement.zoom - 0.1).toFixed(2))) })}
            >
              <Minus className="size-4" />
            </button>
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[ajustement.zoom]}
              onValueChange={(valeurs) => appliquer({ zoom: valeurs[0] ?? 1 })}
              aria-label="Zoom"
            />
            <button
              type="button"
              className="grid size-11 shrink-0 place-items-center rounded-lg border border-border hover:bg-secondary"
              aria-label="Zoom plus"
              onClick={() => appliquer({ zoom: Math.min(3, Number((ajustement.zoom + 0.1).toFixed(2))) })}
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-secondary"
            onClick={() => {
              const img = imageRef.current;
              const rotation = rotationSuivante(ajustement.rotation, -1);
              appliquer({
                rotation,
                offsetX: 0,
                offsetY: 0,
                rogne: img ? rogneInitiale(img.naturalWidth, img.naturalHeight, rotation) : ajustement.rogne,
              });
            }}
          >
            <RotateCcw className="size-4" />
            Rotation gauche
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-secondary"
            onClick={() => {
              const img = imageRef.current;
              const rotation = rotationSuivante(ajustement.rotation, 1);
              appliquer({
                rotation,
                offsetX: 0,
                offsetY: 0,
                rogne: img ? rogneInitiale(img.naturalWidth, img.naturalHeight, rotation) : ajustement.rogne,
              });
            }}
          >
            <RotateCw className="size-4" />
            Rotation droite
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-secondary"
            onClick={() => {
              const img = imageRef.current;
              setAjustement({
                ...AJUSTEMENT_INITIAL,
                rogne: img ? rogneInitiale(img.naturalWidth, img.naturalHeight, 0) : AJUSTEMENT_INITIAL.rogne,
              });
            }}
          >
            Réinitialiser
          </button>
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm hover:bg-secondary"
            disabled={exportEnCours}
            onClick={onAnnuler}
          >
            Annuler
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            disabled={!image || exportEnCours}
            onClick={() => void exporter()}
          >
            {exportEnCours ? "Préparation…" : "Valider l'image"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
