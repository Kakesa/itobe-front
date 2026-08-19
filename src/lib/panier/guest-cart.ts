import type { FormatLivre, GuestPanierItem, PanierData } from "./types";

const CLE = "itobe.panier.invite";

export function lirePanierInvite(): GuestPanierItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestPanierItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function sauvegarderPanierInvite(items: GuestPanierItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLE, JSON.stringify(items));
  window.dispatchEvent(new Event("itobe-panier"));
}

export function viderPanierInvite() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLE);
  window.dispatchEvent(new Event("itobe-panier"));
}

export function ajouterAuPanierInvite(item: GuestPanierItem) {
  const items = lirePanierInvite();
  const existing = items.find((i) => i.slug === item.slug && i.format === item.format);
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + (item.quantity || 1));
    if (item.titre) existing.titre = item.titre;
    if (item.prixUnitaire != null) existing.prixUnitaire = item.prixUnitaire;
  } else {
    items.push({
      slug: item.slug,
      ...(item.titre ? { titre: item.titre } : {}),
      quantity: Math.max(1, item.quantity || 1),
      format: item.format,
      ...(item.prixUnitaire != null ? { prixUnitaire: item.prixUnitaire } : {}),
    });
  }
  sauvegarderPanierInvite(items);
}

export function retirerDuPanierInvite(slug: string) {
  sauvegarderPanierInvite(lirePanierInvite().filter((i) => i.slug !== slug));
}

export function mettreAJourQuantiteInvite(slug: string, quantity: number) {
  const items = lirePanierInvite();
  const idx = items.findIndex((i) => i.slug === slug);
  if (idx === -1) return;
  if (quantity < 1) {
    items.splice(idx, 1);
  } else {
    items[idx]!.quantity = Math.min(99, quantity);
  }
  sauvegarderPanierInvite(items);
}

export function compterArticlesInvite(): number {
  return lirePanierInvite().reduce((n, i) => n + i.quantity, 0);
}

export function panierInviteVersData(): PanierData {
  const items = lirePanierInvite();
  const mapped = items.map((i) => ({
    slug: i.slug,
    titre: i.titre,
    quantity: i.quantity,
    format: i.format,
    prixUnitaire: i.prixUnitaire ?? 0,
    ligneTotal: Number(((i.prixUnitaire ?? 0) * i.quantity).toFixed(2)),
  }));
  const sousTotal = mapped.reduce((s, i) => s + i.ligneTotal!, 0);
  return {
    items: mapped,
    sousTotal,
    total: Number(sousTotal.toFixed(2)),
    itemCount: mapped.reduce((n, i) => n + i.quantity, 0),
  };
}

export function formatParDefaut(formats: string[]): FormatLivre {
  if (formats.includes("Papier")) return "EPUB + PDF";
  return "EPUB + PDF";
}
