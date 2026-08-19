import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { PanierApi, getToken } from "@/lib/api-client";
import {
  ajouterAuPanierInvite,
  compterArticlesInvite,
  lirePanierInvite,
  mettreAJourQuantiteInvite,
  panierInviteVersData,
  retirerDuPanierInvite,
  viderPanierInvite,
  formatParDefaut,
} from "@/lib/panier/guest-cart";
import type { FormatLivre, PanierData } from "@/lib/panier/types";
import { useSession } from "@/hooks/use-session";

const PANIER_KEY = ["panier"] as const;

async function fetchPanier(): Promise<PanierData> {
  const res = await PanierApi.get();
  return (res?.data ?? res) as PanierData;
}

export function usePanier() {
  const { connecte, pret: sessionPret } = useSession();
  const aToken = typeof window !== "undefined" && Boolean(getToken());
  const apiActif = connecte && aToken;
  const queryClient = useQueryClient();
  const [guestCount, setGuestCount] = useState(() => compterArticlesInvite());

  const syncGuest = useCallback(() => setGuestCount(compterArticlesInvite()), []);

  useEffect(() => {
    syncGuest();
    window.addEventListener("itobe-panier", syncGuest);
    window.addEventListener("itobe-session", syncGuest);
    return () => {
      window.removeEventListener("itobe-panier", syncGuest);
      window.removeEventListener("itobe-session", syncGuest);
    };
  }, [syncGuest]);

  const query = useQuery({
    queryKey: PANIER_KEY,
    queryFn: fetchPanier,
    enabled: apiActif && sessionPret,
    staleTime: 30_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: PANIER_KEY });

  const addMutation = useMutation({
    mutationFn: async (payload: {
      slug: string;
      titre?: string;
      quantity?: number;
      format?: FormatLivre;
      prixUnitaire?: number;
    }) => {
      if (apiActif) {
        const res = await PanierApi.addItem({
          livreSlugOrId: payload.slug,
          quantity: payload.quantity ?? 1,
          format: payload.format ?? "EPUB + PDF",
        });
        return (res?.data ?? res) as PanierData;
      }
      ajouterAuPanierInvite({
        slug: payload.slug,
        ...(payload.titre ? { titre: payload.titre } : {}),
        quantity: payload.quantity ?? 1,
        format: payload.format ?? "EPUB + PDF",
        ...(payload.prixUnitaire != null ? { prixUnitaire: payload.prixUnitaire } : {}),
      });
      return panierInviteVersData();
    },
    onSuccess: () => {
      if (apiActif) void invalidate();
      else syncGuest();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      livreIdOrSlug,
      quantity,
    }: {
      livreIdOrSlug: string;
      quantity: number;
    }) => {
      if (apiActif) {
        const res = await PanierApi.updateItem(livreIdOrSlug, { quantity });
        return (res?.data ?? res) as PanierData;
      }
      mettreAJourQuantiteInvite(livreIdOrSlug, quantity);
      return panierInviteVersData();
    },
    onSuccess: () => {
      if (apiActif) void invalidate();
      else syncGuest();
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (livreIdOrSlug: string) => {
      if (apiActif) {
        const res = await PanierApi.removeItem(livreIdOrSlug);
        return (res?.data ?? res) as PanierData;
      }
      retirerDuPanierInvite(livreIdOrSlug);
      return panierInviteVersData();
    },
    onSuccess: () => {
      if (apiActif) void invalidate();
      else syncGuest();
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (apiActif) {
        const res = await PanierApi.clear();
        return (res?.data ?? res) as PanierData;
      }
      viderPanierInvite();
      return panierInviteVersData();
    },
    onSuccess: () => {
      if (apiActif) void invalidate();
      else syncGuest();
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (payload: {
      moyen: string;
      operateur?: string;
      telephone?: string;
      couponCode?: string;
    }) => {
      const res = await PanierApi.checkout(payload);
      return res?.data ?? res;
    },
    onSuccess: () => void invalidate(),
  });

  const panier: PanierData = apiActif
    ? (query.data ?? { items: [], sousTotal: 0, total: 0, itemCount: 0 })
    : panierInviteVersData();

  const itemCount = apiActif ? (query.data?.itemCount ?? 0) : guestCount;

  return {
    panier,
    itemCount,
    loading: apiActif && query.isLoading,
    apiActif,
    formatParDefaut,
    ajouter: addMutation.mutateAsync,
    ajoutEnCours: addMutation.isPending,
    mettreAJourQuantite: updateMutation.mutateAsync,
    retirer: removeMutation.mutateAsync,
    vider: clearMutation.mutateAsync,
    checkout: checkoutMutation.mutateAsync,
    checkoutEnCours: checkoutMutation.isPending,
    itemsInvite: lirePanierInvite,
  };
}

export function usePanierCount() {
  const { itemCount } = usePanier();
  return itemCount;
}
