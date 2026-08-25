/** Types du module Dashboard (front mock, prêt pour API). */

export type PeriodeFiltre =
  | "aujourd-hui"
  | "7j"
  | "30j"
  | "3m"
  | "6m"
  | "annee"
  | "perso";

export type VueEnsemble = {
  media: {
    articles: number;
    publies: number;
    brouillons: number;
    programmes: number;
    categories: number;
    commentaires: number;
    vues: number;
    tempsLectureMoyen: string;
  };
  edition: {
    livres: number;
    publies: number;
    numeriques: number;
    physiques: number;
    brouillons: number;
    archives: number;
    promotions: number;
  };
  utilisateurs: {
    total: number;
    lecteurs: number;
    editeurs: number;
    nouveaux: number;
  };
  paiements: {
    revenusAujourdhui: number;
    revenusMois: number;
    revenusTotaux: number;
    commandes: number;
    reussis: number;
    echoues: number;
  };
};

export type PointSerie = {
  label: string;
  revenus: number;
  ventes: number;
  utilisateurs: number;
  lectures: number;
  telechargements: number;
  articles: number;
  livres: number;
  newsletter: number;
};

export type ActiviteItem = {
  id: string;
  type:
    | "utilisateur"
    | "article"
    | "livre"
    | "commande"
    | "paiement"
    | "commentaire"
    | "newsletter";
  titre: string;
  detail: string;
  date: string;
};

export type AlerteItem = {
  id: string;
  niveau: "critique" | "attention" | "info";
  message: string;
  lien?: string;
};

export type LivreDashboard = {
  slug: string;
  titre: string;
  auteur: string;
  prix: number;
  statut: string;
  lectures: number;
  telechargements: number;
  ventes: number;
  revenus: number;
  couleur: string;
  stock: number;
  categorie: string;
  formats: string[];
};

export type ArticleDashboard = {
  slug: string;
  titre: string;
  categorie: string;
  auteur: string;
  date: string;
  vues: number;
  statut: string;
  image: string;
  tempsLecture: string;
  commentaires: number;
};

export type AuteurDashboard = {
  slug: string;
  nom: string;
  livres: number;
  revenus: number;
  lectures: number;
  telechargements: number;
};

export type DashboardAdminPayload = {
  vue: VueEnsemble;
  series: PointSerie[];
  activites: ActiviteItem[];
  commandes: {
    id: string;
    client: string;
    livre: string;
    prix: number;
    paiement: string;
    date: string;
    statut: string;
  }[];
  derniersLivres: LivreDashboard[];
  derniersArticles: ArticleDashboard[];
  topVentes: LivreDashboard[];
  articlesPopulaires: ArticleDashboard[];
  auteursPopulaires: AuteurDashboard[];
  alertes: AlerteItem[];
  repartitionFormats: { nom: string; valeur: number }[];
  repartitionCategories: { nom: string; valeur: number }[];
};

export type DashboardEditeurPayload = {
  publies: number;
  brouillons: number;
  archives: number;
  revenus: number;
  lectures: number;
  telechargements: number;
  favoris: number;
  dernieresVentes: { id: string; livre: string; client: string; montant: number; date: string }[];
  series: PointSerie[];
  livres: LivreDashboard[];
};

export type DashboardLecteurPayload = {
  prenom: string;
  continuer: { slug: string; titre: string; progression: number; couleur: string }[];
  bibliotheque: { slug: string; titre: string; couleur: string }[];
  favoris: { slug: string; titre: string; couleur: string }[];
  derniersAchats: { slug: string; titre: string; date: string }[];
  historique: { slug: string; titre: string; date: string }[];
  recommandations: { slug: string; titre: string; couleur: string }[];
  nouveautes: { slug: string; titre: string; couleur: string }[];
  tempsLectureTotal: string;
  telechargements: { slug: string; titre: string }[];
  marquePages: { slug: string; titre: string; page: number }[];
  commandes: {
    id: string;
    slug: string;
    titre: string;
    format: string;
    moyen: string;
    reference: string;
    montant: number;
    statut: string;
    date: string;
    motif?: string;
  }[];
};
