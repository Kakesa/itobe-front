import type { Livre } from "@/lib/data";

export function prixNumeriqueLivre(livre: Livre) {
  return livre.promo ?? livre.prix;
}

export function prixPapierLivre(livre: Livre) {
  if (livre.prixPapier != null && livre.prixPapier > 0) return livre.prixPapier;
  return prixNumeriqueLivre(livre);
}

export function prixNumeriqueAffiche(livre: Livre) {
  if (livre.prixPapier != null && livre.prixPapier > 0) {
    return prixNumeriqueLivre(livre);
  }
  return Number((prixNumeriqueLivre(livre) * 0.55).toFixed(2));
}

export function prixLivreFormat(livre: Livre, format: "numerique" | "papier") {
  return format === "papier" ? prixPapierLivre(livre) : prixNumeriqueAffiche(livre);
}
