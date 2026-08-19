import { useEffect, useState } from "react";
import { BibliothequeApi, getToken } from "@/lib/api-client";
import { useSession } from "@/hooks/use-session";

export function useAccesLecture(slug: string, apercuPagesParDefaut: number) {
  const { connecte } = useSession();
  const [accesComplet, setAccesComplet] = useState(false);
  const [motif, setMotif] = useState<"achat" | "premium" | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagesGratuites, setPagesGratuites] = useState(apercuPagesParDefaut);

  useEffect(() => {
    if (!connecte || !getToken()) {
      setAccesComplet(false);
      setMotif(null);
      setPagesGratuites(apercuPagesParDefaut);
      setLoading(false);
      return;
    }

    let annule = false;
    setLoading(true);

    BibliothequeApi.checkAccess(slug)
      .then((res) => {
        if (annule) return;
        const data = res?.data ?? res;
        setAccesComplet(Boolean(data?.accesComplet));
        const m = data?.motif;
        setMotif(m === "achat" || m === "premium" ? m : null);
        setPagesGratuites(Number(data?.pagesGratuites ?? apercuPagesParDefaut));
      })
      .catch(() => {
        if (!annule) {
          setAccesComplet(false);
          setMotif(null);
          setPagesGratuites(apercuPagesParDefaut);
        }
      })
      .finally(() => {
        if (!annule) setLoading(false);
      });

    return () => {
      annule = true;
    };
  }, [slug, connecte, apercuPagesParDefaut]);

  return { accesComplet, motif, loading, pagesGratuites, dejaAchete: motif === "achat" };
}
