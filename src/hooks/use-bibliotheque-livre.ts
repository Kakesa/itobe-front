import { useCallback, useEffect, useRef, useState } from "react";
import { BibliothequeApi, getToken } from "@/lib/api-client";
import { notifierBibliothequeMiseAJour } from "@/hooks/use-a-des-achats";
import { useSession } from "@/hooks/use-session";

async function chargerEtatLivre(slug: string, totalPages: number) {
  const res = await BibliothequeApi.getLibrary();
  const data = res?.data ?? res;

  const favori = (data?.favoris ?? []).some((l: { slug?: string }) => l.slug === slug);

  let pageInitiale = 1;
  const pct = data?.progressions?.[slug];
  if (typeof pct === "number" && totalPages > 0) {
    pageInitiale = Math.max(1, Math.min(totalPages, Math.round((pct / 100) * totalPages)));
  }

  const marques = (data?.marquePages ?? [])
    .filter((m: { livre?: { slug?: string }; page?: number }) => m.livre?.slug === slug)
    .map((m: { page: number }) => m.page);

  return { favori, pageInitiale, marques };
}

/** État bibliothèque d'un livre (favori, marque-pages, reprise de lecture) — données API réelles. */
export function useBibliothequeLivre(slug: string, totalPages: number) {
  const { connecte: sessionConnecte } = useSession();
  const [favori, setFavori] = useState(false);
  const [marques, setMarques] = useState<number[]>([]);
  const [pageInitiale, setPageInitiale] = useState(1);
  const [charge, setCharge] = useState(false);
  const [erreurFavori, setErreurFavori] = useState<string | null>(null);
  const syncRef = useRef(false);

  const apiPret = sessionConnecte && Boolean(getToken());

  const recharger = useCallback(async () => {
    if (!apiPret) {
      setFavori(false);
      setMarques([]);
      setPageInitiale(1);
      setCharge(true);
      return;
    }

    setCharge(false);
    try {
      const etat = await chargerEtatLivre(slug, totalPages);
      setFavori(etat.favori);
      setPageInitiale(etat.pageInitiale);
      setMarques(etat.marques);
    } catch {
      /* ignore */
    } finally {
      setCharge(true);
    }
  }, [apiPret, slug, totalPages]);

  useEffect(() => {
    void recharger();
  }, [recharger]);

  useEffect(() => {
    const sync = () => void recharger();
    window.addEventListener("itobe-session", sync);
    window.addEventListener("itobe-bibliotheque", sync);
    return () => {
      window.removeEventListener("itobe-session", sync);
      window.removeEventListener("itobe-bibliotheque", sync);
    };
  }, [recharger]);

  const toggleFavori = useCallback(async () => {
    setErreurFavori(null);
    if (!getToken()) {
      setErreurFavori("Connectez-vous pour enregistrer vos favoris.");
      return false;
    }
    try {
      const res = await BibliothequeApi.toggleFavori(slug);
      const data = res?.data ?? res;
      if (typeof data?.estFavori === "boolean") {
        setFavori(data.estFavori);
      } else {
        setFavori((v) => !v);
      }
      notifierBibliothequeMiseAJour();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Impossible de modifier le favori.";
      setErreurFavori(msg);
      return false;
    }
  }, [slug]);

  const toggleMarque = useCallback(
    async (page: number) => {
      const present = marques.includes(page);
      setMarques((m) => (present ? m.filter((x) => x !== page) : [...m, page]));

      if (!getToken()) return;
      try {
        await BibliothequeApi.manageBookmark({ slug, page });
        notifierBibliothequeMiseAJour();
      } catch {
        setMarques((m) => (present ? [...m, page] : m.filter((x) => x !== page)));
      }
    },
    [slug, marques],
  );

  const sauverProgression = useCallback(
    async (page: number) => {
      if (!getToken() || syncRef.current) return;
      syncRef.current = true;
      try {
        const pourcentage = Math.min(100, Math.round((page / totalPages) * 100));
        await BibliothequeApi.updateProgress({ slug, page, pourcentage });
        notifierBibliothequeMiseAJour();
      } catch {
        /* ignore */
      } finally {
        syncRef.current = false;
      }
    },
    [slug, totalPages],
  );

  const enregistrerTelechargement = useCallback(async () => {
    if (!getToken()) return false;
    try {
      await BibliothequeApi.registerDownload(slug);
      notifierBibliothequeMiseAJour();
      return true;
    } catch {
      return false;
    }
  }, [slug]);

  return {
    favori,
    toggleFavori,
    marques,
    toggleMarque,
    pageInitiale,
    charge,
    sauverProgression,
    enregistrerTelechargement,
    connecte: apiPret,
    erreurFavori,
  };
}
