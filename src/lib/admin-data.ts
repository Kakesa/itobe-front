// Données de démonstration pour l'administration, les commandes,
// l'abonnement et la synchronisation (front uniquement).

export type Role = "admin" | "editeur" | "redacteur" | "vendeur";

export const roles: { id: Role; label: string; description: string }[] = [
  {
    id: "admin",
    label: "Administrateur",
    description: "Accès complet : contenus, catalogue, ventes et utilisateurs.",
  },
  {
    id: "editeur",
    label: "Éditeur",
    description: "Gestion du catalogue de livres, des auteurs et des catégories.",
  },
  {
    id: "redacteur",
    label: "Rédacteur",
    description: "Rédaction et publication des articles du portail Média.",
  },
  {
    id: "vendeur",
    label: "Ventes",
    description: "Suivi des commandes, paiements et remboursements.",
  },
];

export type SectionAdmin = {
  to: string;
  label: string;
  roles: Role[];
};

export const sectionsAdmin: SectionAdmin[] = [
  { to: "/admin", label: "Vue d'ensemble", roles: ["admin", "editeur", "redacteur", "vendeur"] },
  { to: "/admin/articles", label: "Articles", roles: ["admin", "redacteur"] },
  { to: "/admin/livres", label: "Livres", roles: ["admin", "editeur"] },
  { to: "/admin/categories", label: "Catégories", roles: ["admin", "editeur", "redacteur"] },
  { to: "/admin/auteurs", label: "Auteurs", roles: ["admin", "editeur"] },
  { to: "/admin/commandes", label: "Commandes", roles: ["admin", "vendeur"] },
];

export type Commande = {
  id: string;
  client: string;
  livre: string;
  moyen: "Mobile Money" | "Carte bancaire";
  montant: number;
  statut: "Payée" | "En attente" | "Remboursée";
  date: string;
};

export const commandes: Commande[] = [
  { id: "#10428", client: "Nadia Kabeya", livre: "Le Fleuve et la Page", moyen: "Mobile Money", montant: 12, statut: "Payée", date: "2026-07-28" },
  { id: "#10427", client: "Serge Ilunga", livre: "Grammaire du courage", moyen: "Carte bancaire", montant: 12, statut: "Payée", date: "2026-07-27" },
  { id: "#10426", client: "Aline Mputu", livre: "Histoire des presses africaines", moyen: "Mobile Money", montant: 21, statut: "En attente", date: "2026-07-27" },
  { id: "#10425", client: "Joël Tshibangu", livre: "Nuit blanche à Matonge", moyen: "Mobile Money", montant: 9, statut: "Payée", date: "2026-07-26" },
  { id: "#10424", client: "Grace Lumbu", livre: "Poèmes du quatrième jour", moyen: "Carte bancaire", montant: 8, statut: "Remboursée", date: "2026-07-25" },
  { id: "#10423", client: "Patrick Nzuzi", livre: "Le Fleuve et la Page", moyen: "Mobile Money", montant: 12, statut: "Payée", date: "2026-07-24" },
];

export type Formule = {
  id: "mensuel" | "annuel";
  label: string;
  prix: number;
  periode: string;
  economie?: string;
  avantages: string[];
};

export const formules: Formule[] = [
  {
    id: "mensuel",
    label: "Premium mensuel",
    prix: 6.99,
    periode: "par mois",
    avantages: [
      "Lecture illimitée de tout le catalogue",
      "Téléchargements PDF et EPUB",
      "Articles longs et archives du Média",
      "Synchronisation multi-appareils",
    ],
  },
  {
    id: "annuel",
    label: "Premium annuel",
    prix: 59.9,
    periode: "par an",
    economie: "2 mois offerts",
    avantages: [
      "Tous les avantages du mensuel",
      "Avant-premières et tirages numérotés",
      "Rencontres en ligne avec les auteurs",
      "Support prioritaire",
    ],
  },
];

export type Appareil = {
  id: string;
  nom: string;
  type: "Mobile" | "Tablette" | "Ordinateur";
  derniereSync: string;
  page: number;
  actuel?: boolean;
};

export const appareils: Appareil[] = [
  { id: "d1", nom: "iPhone de Nadia", type: "Mobile", derniereSync: "il y a 3 minutes", page: 128, actuel: true },
  { id: "d2", nom: "iPad salon", type: "Tablette", derniereSync: "hier, 21:40", page: 143 },
  { id: "d3", nom: "MacBook bureau", type: "Ordinateur", derniereSync: "il y a 4 jours", page: 96 },
];
