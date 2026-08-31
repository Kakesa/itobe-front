// Calendrier éditorial : types partagés et utilitaires de période (front only).

export type TypeElement = "article" | "actualite" | "livre";

export type StatutEditorial =
  | "Brouillon"
  | "En revue"
  | "Programmé"
  | "Publié"
  | "Rejeté"
  | "En vente"
  | "Épuisé";

export type ElementCalendrier = {
  id: string;
  type: TypeElement;
  titre: string;
  date: string; // AAAA-MM-JJ
  statut: StatutEditorial;
  categorie?: string;
  auteur?: string;
  lien?: string;
};

export type ReponseCalendrier = {
  periode: { debut: string; fin: string };
  total: number;
  elements: ElementCalendrier[];
};

export const TONS_STATUT: Record<StatutEditorial, string> = {
  Brouillon: "bg-secondary text-muted-foreground",
  "En revue": "bg-ochre/20 text-ochre-foreground",
  Programmé: "bg-ochre/20 text-ochre-foreground",
  Publié: "bg-accent/15 text-accent",
  "En vente": "bg-accent/15 text-accent",
  Rejeté: "bg-destructive/10 text-destructive",
  Épuisé: "bg-destructive/10 text-destructive",
};

export const LIBELLE_TYPE: Record<TypeElement, string> = {
  article: "Article",
  actualite: "Actualité",
  livre: "Livre",
};

export const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Premier / dernier jour du mois d'une date ISO (AAAA-MM). */
export function bornesDuMois(mois: string) {
  const [a, m] = mois.split("-").map(Number);
  const debut = new Date(Date.UTC(a ?? 2026, (m ?? 1) - 1, 1));
  const fin = new Date(Date.UTC(a ?? 2026, m ?? 1, 0));
  return { debut: iso(debut), fin: iso(fin) };
}

/** Grille de 6 semaines (lundi → dimanche) couvrant le mois donné. */
export function grilleDuMois(mois: string): string[] {
  const [a, m] = mois.split("-").map(Number);
  const premier = new Date(Date.UTC(a ?? 2026, (m ?? 1) - 1, 1));
  const decalage = (premier.getUTCDay() + 6) % 7;
  const depart = new Date(premier);
  depart.setUTCDate(premier.getUTCDate() - decalage);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(depart);
    d.setUTCDate(depart.getUTCDate() + i);
    return iso(d);
  });
}

export function moisSuivant(mois: string, pas: number) {
  const [a, m] = mois.split("-").map(Number);
  const d = new Date(Date.UTC(a ?? 2026, (m ?? 1) - 1 + pas, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function libelleMois(mois: string) {
  const { debut } = bornesDuMois(mois);
  return new Date(`${debut}T00:00:00Z`).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const STATUTS_CONNUS: StatutEditorial[] = [
  "Brouillon",
  "En revue",
  "Programmé",
  "Publié",
  "Rejeté",
  "En vente",
  "Épuisé",
];

export function normaliserStatut(valeur: unknown): StatutEditorial {
  const s = String(valeur ?? "Brouillon");
  return (STATUTS_CONNUS.find((v) => v === s) ?? "Brouillon") as StatutEditorial;
}

/** Convertit un item du store admin en élément de calendrier. */
export function versElement(
  type: TypeElement,
  item: Record<string, unknown> & { id: string },
): ElementCalendrier | null {
  const date = String(
    (type === "livre" ? item["publication"] : item["date"]) ?? item["date"] ?? "",
  ).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const statut: StatutEditorial =
    type === "livre"
      ? item["disponible"]
        ? "En vente"
        : "Épuisé"
      : normaliserStatut(item["statut"] ?? item["etat"]);
  return {
    id: item.id,
    type,
    titre: String(item["titre"] ?? "Sans titre"),
    date,
    statut,
    ...(item["categorie"] ? { categorie: String(item["categorie"]) } : {}),
    ...(item["auteur"] ? { auteur: String(item["auteur"]) } : {}),
    lien:
      type === "livre"
        ? `/admin/edition/livres`
        : type === "actualite"
          ? `/admin/media/actualites`
          : `/admin/media/articles`,
  };
}

export function dansPeriode(e: ElementCalendrier, debut: string, fin: string) {
  return e.date >= debut && e.date <= fin;
}
