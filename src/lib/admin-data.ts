// Administration : rôles, navigation et données commerciales (front mock).

export type Role = "admin" | "editeur" | "lecteur";

export const roles: { id: Role; label: string; description: string }[] = [
  {
    id: "admin",
    label: "Administrateur",
    description: "Accès complet à toute la plateforme Média et Maison d'édition.",
  },
  {
    id: "editeur",
    label: "Éditeur",
    description: "Gestion des livres, aperçus, ventes et statistiques de ses ouvrages.",
  },
  {
    id: "lecteur",
    label: "Lecteur",
    description: "Bibliothèque, lecture, favoris, historique et recommandations.",
  },
];

export type SectionAdmin = {
  to: string;
  label: string;
  roles: Role[];
  groupe?: string;
  icon?: string;
};

/** Menu back-office groupé (ADMIN + ÉDITEUR). */
export const menuAdmin: {
  groupe: string;
  items: { to: string; label: string; roles: Role[] }[];
}[] = [
  {
    groupe: "",
    items: [{ to: "/admin", label: "Dashboard", roles: ["admin", "editeur"] }],
  },
  {
    groupe: "Contenu",
    items: [
      { to: "/admin/articles", label: "Articles", roles: ["admin"] },
      { to: "/admin/actualites", label: "Actualités", roles: ["admin"] },
      { to: "/admin/livres", label: "Livres", roles: ["admin", "editeur"] },
      { to: "/admin/auteurs", label: "Auteurs", roles: ["admin", "editeur"] },
      { to: "/admin/categories", label: "Catégories", roles: ["admin", "editeur"] },
      { to: "/admin/medias", label: "Médias", roles: ["admin"] },
    ],
  },
  {
    groupe: "Commercial",
    items: [
      { to: "/admin/commandes", label: "Commandes", roles: ["admin"] },
      { to: "/admin/paiements", label: "Paiements", roles: ["admin"] },
      { to: "/admin/coupons", label: "Coupons", roles: ["admin"] },
      { to: "/admin/promotions", label: "Promotions", roles: ["admin"] },
    ],
  },
  {
    groupe: "Communauté",
    items: [
      { to: "/admin/utilisateurs", label: "Utilisateurs", roles: ["admin"] },
      { to: "/admin/commentaires", label: "Commentaires", roles: ["admin"] },
      { to: "/admin/newsletter", label: "Newsletter", roles: ["admin"] },
    ],
  },
  {
    groupe: "Analytiques",
    items: [
      { to: "/admin/rapports", label: "Rapports", roles: ["admin", "editeur"] },
      { to: "/admin/statistiques", label: "Statistiques", roles: ["admin", "editeur"] },
    ],
  },
  {
    groupe: "Paramètres",
    items: [
      { to: "/admin/parametres", label: "Paramètres", roles: ["admin"] },
      { to: "/admin/seo", label: "SEO", roles: ["admin"] },
      { to: "/admin/roles", label: "Rôles & Permissions", roles: ["admin"] },
    ],
  },
];

/** @deprecated Utiliser menuAdmin — conservé pour compatibilité. */
export const sectionsAdmin: SectionAdmin[] = menuAdmin.flatMap((g) =>
  g.items.map((i) => ({ ...i, groupe: g.groupe })),
);

export type Commande = {
  id: string;
  client: string;
  livre: string;
  moyen: "Mobile Money" | "Carte bancaire";
  montant: number;
  statut: "Payée" | "En attente" | "Échouée" | "Remboursée";
  date: string;
};

export const commandes: Commande[] = [
  { id: "#10428", client: "Nadia Kabeya", livre: "Le Fleuve et la Page", moyen: "Mobile Money", montant: 12, statut: "Payée", date: "2026-07-28" },
  { id: "#10427", client: "Serge Ilunga", livre: "Grammaire du courage", moyen: "Carte bancaire", montant: 12, statut: "Payée", date: "2026-07-27" },
  { id: "#10426", client: "Aline Mputu", livre: "Histoire des presses africaines", moyen: "Mobile Money", montant: 21, statut: "En attente", date: "2026-07-27" },
  { id: "#10425", client: "Joël Tshibangu", livre: "Nuit blanche à Matonge", moyen: "Mobile Money", montant: 9, statut: "Payée", date: "2026-07-26" },
  { id: "#10424", client: "Grace Lumbu", livre: "Poèmes du quatrième jour", moyen: "Carte bancaire", montant: 8, statut: "Remboursée", date: "2026-07-25" },
  { id: "#10423", client: "Patrick Nzuzi", livre: "Le Fleuve et la Page", moyen: "Mobile Money", montant: 12, statut: "Payée", date: "2026-07-24" },
  { id: "#10422", client: "Ruth Kalala", livre: "Le cartable de Kimia", moyen: "Carte bancaire", montant: 7, statut: "Échouée", date: "2026-07-23" },
  { id: "#10421", client: "David Mukendi", livre: "Grammaire du courage", moyen: "Mobile Money", montant: 12, statut: "Payée", date: "2026-07-22" },
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
