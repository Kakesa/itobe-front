import { useEffect, useRef, useState } from "react";

interface PdfViewerProps {
  url: string;
  page: number;
  zoom?: number;
  onPagesLoaded?: (pages: number) => void;
  onError?: (message: string) => void;
}

let pdfjsPromise: Promise<any> | null = null;

async function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then(async (mod: any) => {
      const worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
      mod.GlobalWorkerOptions.workerSrc = worker.default;
      return mod;
    });
  }
  return pdfjsPromise;
}

/** Visionneuse PDF réelle (rendu canvas via pdf.js), page par page. */
export function PdfViewer({ url, page, zoom = 1, onPagesLoaded, onError }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const docRef = useRef<any>(null);
  const conteneurRef = useRef<HTMLDivElement | null>(null);
  const [chargement, setChargement] = useState(true);

  // Chargement du document
  useEffect(() => {
    let actif = true;
    setChargement(true);
    void (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const doc = await pdfjs.getDocument({ url, withCredentials: false }).promise;
        if (!actif) {
          void doc.destroy();
          return;
        }
        docRef.current = doc;
        onPagesLoaded?.(doc.numPages);
        setChargement(false);
      } catch (e: any) {
        if (actif) {
          setChargement(false);
          onError?.(e?.message ?? "PDF illisible");
        }
      }
    })();
    return () => {
      actif = false;
      const doc = docRef.current;
      docRef.current = null;
      if (doc) void doc.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Rendu de la page courante
  useEffect(() => {
    let annule = false;
    let task: any = null;
    void (async () => {
      const doc = docRef.current;
      const canvas = canvasRef.current;
      if (!doc || !canvas || chargement) return;
      const numero = Math.min(Math.max(1, page), doc.numPages);
      const pdfPage = await doc.getPage(numero);
      if (annule) return;
      const largeurDispo = conteneurRef.current?.clientWidth ?? 700;
      const base = pdfPage.getViewport({ scale: 1 });
      const scale = ((largeurDispo / base.width) * zoom) || 1;
      const viewport = pdfPage.getViewport({ scale });
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      task = pdfPage.render({ canvasContext: ctx, viewport, canvas });
      try {
        await task.promise;
      } catch {
        /* rendu annulé */
      }
    })();
    return () => {
      annule = true;
      task?.cancel?.();
    };
  }, [page, zoom, chargement]);

  return (
    <div ref={conteneurRef} className="w-full">
      {chargement && (
        <div className="grid h-96 place-items-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
          Chargement du document…
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full rounded-2xl border border-border bg-white shadow-xs ${chargement ? "hidden" : ""}`}
      />
    </div>
  );
}
