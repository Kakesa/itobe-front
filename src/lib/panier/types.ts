export type FormatLivre = "EPUB + PDF" | "PDF" | "Accès en ligne" | "Papier";

export type PanierItem = {
  livreId?: string | undefined;
  slug?: string | undefined;
  titre?: string | undefined;
  auteur?: string | { nom?: string; slug?: string };
  couverture?: string;
  couleur?: string;
  quantity: number;
  format: FormatLivre;
  prixUnitaire: number;
  ligneTotal?: number;
};

export type PanierData = {
  id?: string | null;
  items: PanierItem[];
  sousTotal: number;
  total: number;
  itemCount: number;
  updatedAt?: string;
};

export type GuestPanierItem = {
  slug: string;
  titre?: string | undefined;
  quantity: number;
  format: FormatLivre;
  prixUnitaire?: number | undefined;
};
