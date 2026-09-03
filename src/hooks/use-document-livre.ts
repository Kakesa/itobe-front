import { useEffect, useState } from "react";
import { fetchProtectedBookDocument } from "@/lib/api-client";
import { resolveMediaUrl } from "@/lib/media-url";
import type { Livre } from "@/lib/data";

export type SourceDocument = "protege" | "public" | "aucun";

export interface DocumentLivre {
  /** URL exploitable par la visionneuse PDF (blob: ou http). */
  url: string | null;
  source: SourceDocument;
  chargement: boolean;
  /** Message technique lorsque l'endpoint sécurisé échoue. */
  erreur: string | null;
}

/**
 * Résolution du document de lecture selon la priorité validée :
 * 1. endpoint sécurisé fetchProtectedBookDocument(slug)
 * 2. livre.fichiers.pdfUrl (fallback public, seulement s'il est accessible)
 * 3. aucun → la liseuse conserve chapitres Tiptap puis pageTexte()
 */
export function useDocumentLivre(slug: string, livre: Livre | undefined): DocumentLivre {
  const [etat, setEtat] = useState<DocumentLivre>({
    url: null,
    source: "aucun",
    chargement: true,
    erreur: null,
  });

  const pdfPublic = resolveMediaUrl(livre?.fichiers?.pdfUrl) ?? null;

  useEffect(() => {
    let actif = true;
    let objectUrl: string | null = null;
    setEtat({ url: null, source: "aucun", chargement: true, erreur: null });

    const accessible = async (url: string) => {
      try {
        const r = await fetch(url, { method: "HEAD" });
        if (r.ok) return true;
      } catch {
        /* CORS ou réseau : on tente un GET partiel */
      }
      try {
        const r = await fetch(url, { headers: { Range: "bytes=0-0" } });
        return r.ok || r.status === 206;
      } catch {
        return false;
      }
    };

    void (async () => {
      let erreur: string | null = null;

      try {
        const url = await fetchProtectedBookDocument(slug);
        if (!actif) return;
        if (url) {
          if (url.startsWith("blob:")) objectUrl = url;
          setEtat({ url, source: "protege", chargement: false, erreur: null });
          return;
        }
      } catch (e: any) {
        erreur = e?.message ? `${e.message}${e.statusCode ? ` (${e.statusCode})` : ""}` : String(e);
      }

      if (pdfPublic && (await accessible(pdfPublic))) {
        if (!actif) return;
        setEtat({ url: pdfPublic, source: "public", chargement: false, erreur });
        return;
      }

      if (!actif) return;
      setEtat({ url: null, source: "aucun", chargement: false, erreur });
    })();

    return () => {
      actif = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [slug, pdfPublic]);

  return etat;
}
