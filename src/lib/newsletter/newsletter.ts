// Module Newsletter (front only) : types, segments, blocs de contenu et statistiques.
import type { Item } from "@/lib/admin/seeds";

/* ---------------- Abonnés ---------------- */

export const STATUTS_ABONNE = ["ACTIVE", "UNSUBSCRIBED", "BOUNCED", "BLOCKED"] as const;
export type StatutAbonne = (typeof STATUTS_ABONNE)[number];

export const LIBELLE_ABONNE: Record<StatutAbonne, string> = {
  ACTIVE: "Actif",
  UNSUBSCRIBED: "Désabonné",
  BOUNCED: "Rebond",
  BLOCKED: "Bloqué",
};

export const TON_ABONNE: Record<StatutAbonne, string> = {
  ACTIVE: "bg-accent/15 text-accent",
  UNSUBSCRIBED: "bg-secondary text-muted-foreground",
  BOUNCED: "bg-ochre/20 text-ochre-foreground",
  BLOCKED: "bg-destructive/10 text-destructive",
};

export const SOURCES_ABONNE = [
  "Site web",
  "Achat de livre",
  "Import",
  "Ajout manuel",
  "Premium",
] as const;

/* ---------------- Segments ---------------- */

export type Segment = {
  id: string;
  label: string;
  description: string;
  /** Critère appliqué côté front sur la fiche abonné. */
  filtre: (a: Item) => boolean;
};

export const segments: Segment[] = [
  {
    id: "tous",
    label: "Tous les abonnés",
    description: "Toute la base opt-in active.",
    filtre: (a) => a["statut"] === "ACTIVE",
  },
  {
    id: "nouveaux",
    label: "Nouveaux abonnés",
    description: "Inscrits au cours des 30 derniers jours.",
    filtre: (a) =>
      a["statut"] === "ACTIVE" &&
      Date.now() - new Date(String(a["inscription"] ?? "")).getTime() < 30 * 864e5,
  },
  {
    id: "media",
    label: "Lecteurs du média",
    description: "Abonnés intéressés par les articles et actualités.",
    filtre: (a) => a["statut"] === "ACTIVE" && String(a["interet"]) !== "Édition",
  },
  {
    id: "acheteurs",
    label: "Acheteurs de livres",
    description: "Abonnés ayant déjà acheté au moins un livre.",
    filtre: (a) => a["statut"] === "ACTIVE" && Number(a["achats"] ?? 0) > 0,
  },
  {
    id: "reguliers",
    label: "Lecteurs réguliers",
    description: "Interaction avec une campagne dans les 60 derniers jours.",
    filtre: (a) =>
      a["statut"] === "ACTIVE" &&
      Date.now() - new Date(String(a["interaction"] ?? "")).getTime() < 60 * 864e5,
  },
  {
    id: "premium",
    label: "Abonnés premium",
    description: "Membres avec un abonnement Premium actif.",
    filtre: (a) => a["statut"] === "ACTIVE" && Boolean(a["premium"]),
  },
];

export const segmentParId = (id: string) => segments.find((s) => s.id === id) ?? segments[0]!;

export function tailleSegment(abonnes: Item[], id: string) {
  return abonnes.filter(segmentParId(id).filtre).length;
}

/* ---------------- Campagnes ---------------- */

export const STATUTS_CAMPAGNE = [
  "DRAFT",
  "SCHEDULED",
  "SENDING",
  "SENT",
  "CANCELLED",
  "FAILED",
] as const;
export type StatutCampagne = (typeof STATUTS_CAMPAGNE)[number];

export const LIBELLE_CAMPAGNE: Record<StatutCampagne, string> = {
  DRAFT: "Brouillon",
  SCHEDULED: "Programmée",
  SENDING: "Envoi en cours",
  SENT: "Envoyée",
  CANCELLED: "Annulée",
  FAILED: "Échouée",
};

export const TON_CAMPAGNE: Record<StatutCampagne, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  SCHEDULED: "bg-ochre/20 text-ochre-foreground",
  SENDING: "bg-primary/10 text-primary",
  SENT: "bg-accent/15 text-accent",
  CANCELLED: "bg-secondary text-muted-foreground",
  FAILED: "bg-destructive/10 text-destructive",
};

/* ---------------- Blocs de contenu ---------------- */

export const TYPES_BLOC = [
  "TEXT",
  "IMAGE",
  "BUTTON",
  "ARTICLE",
  "BOOK",
  "DIVIDER",
  "SOCIAL_LINKS",
  "FOOTER",
] as const;
export type TypeBloc = (typeof TYPES_BLOC)[number];

export const LIBELLE_BLOC: Record<TypeBloc, string> = {
  TEXT: "Texte",
  IMAGE: "Image",
  BUTTON: "Bouton",
  ARTICLE: "Article",
  BOOK: "Livre",
  DIVIDER: "Séparateur",
  SOCIAL_LINKS: "Réseaux sociaux",
  FOOTER: "Pied de page",
};

export type Bloc = {
  id: string;
  type: TypeBloc;
  titre?: string;
  sousTitre?: string;
  texte?: string;
  image?: string;
  lien?: string;
  libelleLien?: string;
  reference?: string;
};

export const nouveauBloc = (type: TypeBloc): Bloc => {
  const id = `blc-${Math.random().toString(36).slice(2, 8)}`;
  switch (type) {
    case "TEXT":
      return { id, type, titre: "Titre de section", sousTitre: "", texte: "Votre texte ici…" };
    case "IMAGE":
      return { id, type, image: "", texte: "Légende de l'image" };
    case "BUTTON":
      return { id, type, libelleLien: "Découvrir", lien: "https://itobe.cd" };
    case "ARTICLE":
      return { id, type, titre: "Article à la une", reference: "", lien: "" };
    case "BOOK":
      return { id, type, titre: "Livre mis en avant", reference: "", lien: "" };
    case "DIVIDER":
      return { id, type };
    case "SOCIAL_LINKS":
      return { id, type, texte: "Facebook · X · Instagram · LinkedIn" };
    case "FOOTER":
      return {
        id,
        type,
        texte:
          "Itobe Entreprise — Kinshasa, RDC. Vous recevez cet e-mail car vous êtes inscrit à notre newsletter.",
      };
  }
};

export function blocsDe(valeur: unknown): Bloc[] {
  if (Array.isArray(valeur)) return valeur as Bloc[];
  if (typeof valeur === "string" && valeur.trim().startsWith("[")) {
    try {
      return JSON.parse(valeur) as Bloc[];
    } catch {
      return [];
    }
  }
  return [];
}

/* ---------------- Statistiques ---------------- */

export type Stats = {
  destinataires: number;
  envoyes: number;
  delivres: number;
  erreurs: number;
  ouvertures: number;
  clics: number;
  desabonnements: number;
};

export function statsDe(c: Item): Stats {
  const destinataires = Number(c["destinataires"] ?? 0);
  const envoyes = Number(c["envoyes"] ?? 0);
  const delivres = Number(c["delivres"] ?? 0);
  return {
    destinataires,
    envoyes,
    delivres,
    erreurs: Math.max(0, envoyes - delivres),
    ouvertures: Number(c["ouvertures"] ?? 0),
    clics: Number(c["clics"] ?? 0),
    desabonnements: Number(c["desabonnements"] ?? 0),
  };
}

export const taux = (part: number, total: number) =>
  total > 0 ? `${((part / total) * 100).toFixed(1)} %` : "—";

export const nombre = (n: number) => n.toLocaleString("fr-FR");

export function formatDateHeure(valeur: unknown) {
  const v = String(valeur ?? "");
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
