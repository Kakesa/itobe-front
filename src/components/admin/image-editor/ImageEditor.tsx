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
  RATIO_PAGE_LIVRE,
  bornesDeplacement,
  dessinerImage,
  estAjustementInitial,
  limiterDeplacement,
  tailleExport,
  type AjustementImage,
} from "./cadre-page";

type ResultatImage = { inchange: true } | { inchange: false; fichier: File };

interface ImageEditorProps {
  ouvert: boolean;
  /** URL blob ou URL déjà stockée. */
  source: string;
  nom: string;
  onAnnuler: () => void;
  onValider: (resultat: ResultatImage) => void;
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
  onAnnuler,
  onValider,
}: ImageEditorProps) {
  const cadreRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const glisser = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ajustement, setAjustement] = useState<AjustementImage>(AJUSTEMENT_INITIAL);
  const [tailleCadre, setTailleCadre] = useState({ w: 0, h: 0 });
  const [exportEnCours, setExportEnCours] = useState(false);

  useEffect(() => {
    if (!ouvert) return;
    setAjustement(AJUSTEMENT_INITIAL);
    setErreur(null);
    setImage(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setImage(img);
    };
    img.onerror = () => setErreur("Impossible de charger cette image.");
    img.src = source;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [ouvert, source]);

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
    dessinerImage(ctx, img, img.naturalWidth, img.naturalHeight, tailleCadre.w, tailleCadre.h, ajustement);
  }, [ajustement, tailleCadre, image]);

  const appliquer = (partiel: Partial<AjustementImage>) => {
    const img = imageRef.current;
    setAjustement((actuel) => {
      const suivant = { ...actuel, ...partiel };
      if (!img || tailleCadre.w < 2) return suivant;
      const bornes = bornesDeplacement(
        tailleCadre.w,
        tailleCadre.h,
        img.naturalWidth,
        img.naturalHeight,
        suivant,
      );
      const borne = limiterDeplacement(suivant.offsetX, suivant.offsetY, bornes.maxX, bornes.maxY);
      return { ...suivant, ...borne };
    });
  };

  const exporter = async () => {
    const img = imageRef.current;
    if (!img || tailleCadre.w < 2) return;
    if (estAjustementInitial(ajustement)) {
      onValider({ inchange: true });
      return;
    }

    setExportEnCours(true);
    try {
      const { width, height } = tailleExport(
        tailleCadre.w,
        tailleCadre.h,
        img.naturalWidth,
        img.naturalHeight,
        ajustement,
      );
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
      ctx.setTransform(width / tailleCadre.w, 0, 0, height / tailleCadre.h, 0, 0);
      dessinerImage(ctx, img, img.naturalWidth, img.naturalHeight, tailleCadre.w, tailleCadre.h, ajustement);

      const type = png ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => {
        sortie.toBlob(resolve, type, 0.92);
      });
      if (!blob) throw new Error("Export impossible");
      const base = nom.replace(/\.[^.]+$/, "") || "page";
      const fichier = new File([blob], `${base}.${png ? "png" : "jpg"}`, { type });
      onValider({ inchange: false, fichier });
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
            Recadrez l'image dans le format d'une page du lecteur. Les proportions d'origine sont conservées.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={cadreRef}
          className="relative mx-auto w-full max-w-md touch-none overflow-hidden rounded-lg border border-border bg-muted"
          style={{ aspectRatio: String(RATIO_PAGE_LIVRE) }}
          onPointerDown={(event) => {
            if (!image) return;
            (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
            glisser.current = {
              x: event.clientX,
              y: event.clientY,
              ox: ajustement.offsetX,
              oy: ajustement.offsetY,
            };
          }}
          onPointerMove={(event) => {
            const depart = glisser.current;
            if (!depart) return;
            appliquer({
              offsetX: depart.ox + (event.clientX - depart.x),
              offsetY: depart.oy + (event.clientY - depart.y),
            });
          }}
          onPointerUp={() => {
            glisser.current = null;
          }}
          onPointerCancel={() => {
            glisser.current = null;
          }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" />
          {!image && !erreur ? (
            <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Chargement…</p>
          ) : null}
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
            onClick={() => appliquer({ rotation: rotationSuivante(ajustement.rotation, -1), offsetX: 0, offsetY: 0 })}
          >
            <RotateCcw className="size-4" />
            Rotation gauche
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-secondary"
            onClick={() => appliquer({ rotation: rotationSuivante(ajustement.rotation, 1), offsetX: 0, offsetY: 0 })}
          >
            <RotateCw className="size-4" />
            Rotation droite
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-secondary"
            onClick={() => setAjustement(AJUSTEMENT_INITIAL)}
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
