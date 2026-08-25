import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { BibliothequeApi, getToken } from "@/lib/api-client";
import { dashboardKeys } from "@/lib/dashboard/queries";
import { useSession } from "@/hooks/use-session";

export const ACHATS_QUERY_KEY = ["bibliotheque-a-des-achats"] as const;

async function verifierAchats(): Promise<boolean> {
  if (!getToken()) return false;
  const res = await BibliothequeApi.getLibrary();
  const achetes = res?.data?.achetes ?? res?.achetes ?? [];
  return Array.isArray(achetes) && achetes.length > 0;
}

/** Vrai si l'utilisateur connecté (JWT) possède au moins un livre acheté. */
export function useADesAchats() {
  const { connecte } = useSession();
  const queryClient = useQueryClient();
  const apiActif = connecte && typeof window !== "undefined" && Boolean(getToken());

  const query = useQuery({
    queryKey: ACHATS_QUERY_KEY,
    queryFn: verifierAchats,
    enabled: apiActif,
    staleTime: 30_000,
  });

  useEffect(() => {
    const sync = () => {
      if (apiActif) {
        void queryClient.invalidateQueries({ queryKey: ACHATS_QUERY_KEY });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.lecteur() });
      }
    };
    window.addEventListener("itobe-session", sync);
    window.addEventListener("itobe-bibliotheque", sync);
    return () => {
      window.removeEventListener("itobe-session", sync);
      window.removeEventListener("itobe-bibliotheque", sync);
    };
  }, [apiActif, queryClient]);

  return {
    aDesAchats: apiActif ? Boolean(query.data) : false,
    loading: apiActif && query.isLoading,
  };
}

export function notifierBibliothequeMiseAJour() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("itobe-bibliotheque"));
  }
}
