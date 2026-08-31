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

/** Menu espace Média (admin). */
export const menuMediaAdmin: {
  groupe: string;
  items: { to: string; label: string; roles: Role[] }[];
}[] = [
  {
    groupe: "",
    items: [{ to: "/admin/media", label: "Dashboard", roles: ["admin"] }],
  },
  {
    groupe: "Contenu Média",
    items: [
      { to: "/admin/media/articles", label: "Articles", roles: ["admin"] },
      { to: "/admin/media/actualites", label: "Actualités", roles: ["admin"] },
      { to: "/admin/media/medias", label: "Médiathèque", roles: ["admin"] },
      { to: "/admin/media/categories", label: "Catégories", roles: ["admin"] },
      { to: "/admin/media/calendrier", label: "Calendrier éditorial", roles: ["admin"] },
    ],
  },
  {
    groupe: "Audience",
    items: [
      { to: "/admin/media/commentaires", label: "Commentaires", roles: ["admin"] },
      { to: "/admin/media/newsletter", label: "Newsletter", roles: ["admin"] },
    ],
  },
  {
    groupe: "Analytiques",
    items: [
      { to: "/admin/media/rapports", label: "Rapports", roles: ["admin"] },
      { to: "/admin/media/statistiques", label: "Statistiques", roles: ["admin"] },
    ],
  },
  {
    groupe: "Paramètres",
    items: [
      { to: "/admin/media/mon-profil", label: "Mon profil", roles: ["admin"] },
      { to: "/admin/media/utilisateurs", label: "Utilisateurs", roles: ["admin"] },
      { to: "/admin/media/parametres", label: "Plateforme", roles: ["admin"] },
      { to: "/admin/media/roles", label: "Rôles & Permissions", roles: ["admin"] },
    ],
  },
];

/** Menu espace Édition (admin + éditeur). */
export const menuEditionAdmin: {
  groupe: string;
  items: { to: string; label: string; roles: Role[] }[];
}[] = [
  {
    groupe: "",
    items: [{ to: "/admin/edition", label: "Dashboard", roles: ["admin", "editeur"] }],
  },
  {
    groupe: "Catalogue",
    items: [
      { to: "/admin/edition/livres", label: "Livres", roles: ["admin", "editeur"] },
      { to: "/admin/edition/auteurs", label: "Auteurs", roles: ["admin", "editeur"] },
      { to: "/admin/edition/categories", label: "Catégories", roles: ["admin", "editeur"] },
      { to: "/admin/edition/calendrier", label: "Calendrier éditorial", roles: ["admin", "editeur"] },
    ],
  },
  {
    groupe: "Commercial",
    items: [
      { to: "/admin/edition/commandes", label: "Commandes", roles: ["admin"] },
      { to: "/admin/edition/paiements", label: "Paiements", roles: ["admin"] },
      { to: "/admin/edition/coupons", label: "Coupons", roles: ["admin"] },
      { to: "/admin/edition/promotions", label: "Promotions", roles: ["admin"] },
    ],
  },
  {
    groupe: "Analytiques",
    items: [
      { to: "/admin/edition/rapports", label: "Rapports", roles: ["admin", "editeur"] },
      { to: "/admin/edition/statistiques", label: "Statistiques", roles: ["admin", "editeur"] },
    ],
  },
  {
    groupe: "Paramètres",
    items: [{ to: "/admin/edition/mon-profil", label: "Mon profil", roles: ["admin", "editeur"] }],
  },
];

/** Menu espace lecteur. */
export const menuLecteurAdmin: {
  groupe: string;
  items: { to: string; label: string; roles: Role[] }[];
}[] = [
  {
    groupe: "",
    items: [{ to: "/admin", label: "Dashboard", roles: ["lecteur"] }],
  },
  {
    groupe: "Ma lecture",
    items: [
      { to: "/admin/ma-bibliotheque", label: "Bibliothèque", roles: ["lecteur"] },
      { to: "/admin/favoris", label: "Favoris", roles: ["lecteur"] },
      { to: "/admin/historique", label: "Historique", roles: ["lecteur"] },
      { to: "/admin/telechargements", label: "Téléchargements", roles: ["lecteur"] },
      { to: "/admin/marque-pages", label: "Marque-pages", roles: ["lecteur"] },
    ],
  },
  {
    groupe: "Achats",
    items: [{ to: "/admin/mes-achats", label: "Mes achats", roles: ["lecteur"] }],
  },
  {
    groupe: "Compte",
    items: [{ to: "/admin/mon-profil", label: "Mon profil", roles: ["lecteur"] }],
  },
];

/** @deprecated — menus scindés par portail : menuMediaAdmin, menuEditionAdmin, menuLecteurAdmin */
export const menuAdmin: {
  groupe: string;
  items: { to: string; label: string; roles: Role[] }[];
}[] = [
  {
    groupe: "",
    items: [{ to: "/admin", label: "Dashboard", roles: ["admin", "editeur", "lecteur"] }],
  },
  {
    groupe: "Ma lecture",
    items: [
      { to: "/admin/ma-bibliotheque", label: "Bibliothèque", roles: ["lecteur"] },
      { to: "/admin/favoris", label: "Favoris", roles: ["lecteur"] },
      { to: "/admin/historique", label: "Historique", roles: ["lecteur"] },
      { to: "/admin/telechargements", label: "Téléchargements", roles: ["lecteur"] },
      { to: "/admin/marque-pages", label: "Marque-pages", roles: ["lecteur"] },
    ],
  },
  {
    groupe: "Contenu",
    items: [
      { to: "/admin/articles", label: "Articles", roles: ["admin"] },
      { to: "/admin/actualites", label: "Actualités", roles: ["admin"] },
      { to: "/admin/livres", label: "Livres", roles: ["admin", "editeur"] },
      { to: "/admin/auteurs", label: "Auteurs", roles: ["admin", "editeur"] },
      { to: "/admin/categories", label: "Catégories", roles: ["admin", "editeur"] },
      { to: "/admin/medias", label: "Médiathèque", roles: ["admin"] },
      { to: "/admin/calendrier", label: "Calendrier éditorial", roles: ["admin", "editeur"] },
    ],
  },
  {
    groupe: "Commercial",
    items: [
      { to: "/admin/commandes", label: "Commandes", roles: ["admin"] },
      { to: "/admin/mes-achats", label: "Mes achats", roles: ["lecteur"] },
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
      { to: "/admin/mon-profil", label: "Mon profil", roles: ["admin", "editeur", "lecteur"] },
      { to: "/admin/parametres", label: "Plateforme", roles: ["admin"] },
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

/* ------------------------------------------------------------------ */
/* Facturation & échéances Premium                                     */
/* ------------------------------------------------------------------ */

export type Facture = {
  id: string;
  date: string;
  libelle: string;
  montant: number;
  statut: "Payée" | "En attente" | "Échouée";
  moyen: "Mobile Money" | "Carte bancaire";
};

export const factures: Facture[] = [
  { id: "FCT-2026-07", date: "2026-07-05", libelle: "Premium mensuel — juillet", montant: 6.99, statut: "Payée", moyen: "Mobile Money" },
  { id: "FCT-2026-06", date: "2026-06-05", libelle: "Premium mensuel — juin", montant: 6.99, statut: "Payée", moyen: "Mobile Money" },
  { id: "FCT-2026-05", date: "2026-05-05", libelle: "Premium mensuel — mai", montant: 6.99, statut: "Échouée", moyen: "Carte bancaire" },
  { id: "FCT-2026-04", date: "2026-04-05", libelle: "Premium mensuel — avril", montant: 6.99, statut: "Payée", moyen: "Carte bancaire" },
];

/* ------------------------------------------------------------------ */
/* Sécurité du compte                                                  */
/* ------------------------------------------------------------------ */

export type Connexion = {
  id: string;
  appareil: string;
  navigateur: string;
  lieu: string;
  ip: string;
  date: string;
  statut: "Réussie" | "Échouée";
  actuelle?: boolean;
};

export const connexions: Connexion[] = [
  { id: "c1", appareil: "iPhone 14", navigateur: "Safari Mobile", lieu: "Kinshasa, RDC", ip: "41.243.xx.18", date: "2026-08-07 01:12", statut: "Réussie", actuelle: true },
  { id: "c2", appareil: "MacBook Pro", navigateur: "Chrome 128", lieu: "Kinshasa, RDC", ip: "41.243.xx.7", date: "2026-08-05 19:40", statut: "Réussie" },
  { id: "c3", appareil: "Windows 11", navigateur: "Edge 127", lieu: "Lubumbashi, RDC", ip: "197.157.xx.90", date: "2026-08-02 08:05", statut: "Échouée" },
  { id: "c4", appareil: "iPad", navigateur: "Safari", lieu: "Brazzaville, Congo", ip: "160.120.xx.33", date: "2026-07-29 21:15", statut: "Réussie" },
];

/* ------------------------------------------------------------------ */
/* Workflow de modération éditoriale                                   */
/* ------------------------------------------------------------------ */

export type EtatModeration = "Brouillon" | "En revue" | "Publié" | "Rejeté";

export const etatsModeration: EtatModeration[] = ["Brouillon", "En revue", "Publié", "Rejeté"];

/** Transitions autorisées par rôle. */
export const transitions: Record<Role, Partial<Record<EtatModeration, EtatModeration[]>>> = {
  editeur: {
    Brouillon: ["En revue"],
    Rejeté: ["Brouillon"],
  },
  admin: {
    Brouillon: ["En revue", "Publié"],
    "En revue": ["Publié", "Rejeté", "Brouillon"],
    Publié: ["Brouillon"],
    Rejeté: ["Brouillon", "Publié"],
  },
  lecteur: {},
};

/* ------------------------------------------------------------------ */
/* Mes commandes (espace lecteur)                                      */
/* ------------------------------------------------------------------ */

export type MaCommande = {
  id: string;
  slug: string;
  titre: string;
  format: "EPUB + PDF" | "PDF" | "Accès en ligne";
  moyen: "Mobile Money" | "Carte bancaire";
  reference: string;
  montant: number;
  statut: "Payée" | "En attente" | "Échouée" | "Remboursée";
  date: string;
  motif?: string;
};

export const mesCommandes: MaCommande[] = [
  { id: "CMD-10428", slug: "le-fleuve-et-la-page", titre: "Le Fleuve et la Page", format: "EPUB + PDF", moyen: "Mobile Money", reference: "MM-88214003", montant: 12, statut: "Payée", date: "2026-07-28" },
  { id: "CMD-10419", slug: "nuit-blanche-a-matonge", titre: "Nuit blanche à Matonge", format: "PDF", moyen: "Carte bancaire", reference: "CB-4021-9987", montant: 9, statut: "Payée", date: "2026-07-14" },
  { id: "CMD-10412", slug: "grammaire-du-courage", titre: "Grammaire du courage", format: "Accès en ligne", moyen: "Mobile Money", reference: "MM-88101772", montant: 12, statut: "En attente", date: "2026-07-06" },
  { id: "CMD-10405", slug: "poemes-du-quatrieme-jour", titre: "Poèmes du quatrième jour", format: "EPUB + PDF", moyen: "Carte bancaire", reference: "CB-4021-7712", montant: 8, statut: "Échouée", date: "2026-06-29", motif: "Carte refusée par la banque émettrice (code 51)." },
  { id: "CMD-10398", slug: "le-cartable-de-kimia", titre: "Le cartable de Kimia", format: "PDF", moyen: "Mobile Money", reference: "MM-87990441", montant: 7, statut: "Remboursée", date: "2026-06-18" },
];
