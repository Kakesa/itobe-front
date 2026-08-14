// Jeux de données initiaux pour les modules du back-office (front mock).
import { articles, auteurs, categoriesLivres, categoriesMedia, livres } from "@/lib/data";
import { commandes } from "@/lib/admin-data";

export type Item = Record<string, unknown> & { id: string };

const etatCycle = ["Brouillon", "En revue", "Rejeté", "En revue"] as const;

export const seedArticles: Item[] = articles.map((a, i) => ({
  id: a.slug,
  titre: a.titre,
  categorie: a.categorie,
  auteur: a.auteur,
  date: a.date,
  lecture: a.lecture,
  chapo: a.chapo,
  etat: a.populaire ? "Publié" : etatCycle[i % 4],
}));

export const seedLivres: Item[] = livres.map((l) => ({
  id: l.slug,
  publication: l.publication,
  titre: l.titre,
  auteur: l.auteur,
  categorie: l.categorie,
  formats: l.formats.join(", "),
  prix: l.prix,
  promo: l.promo ?? 0,
  stock: l.stock,
  disponible: l.disponible,
  couverture: l.couverture ?? "",
  couleur: l.couleur,
}));

export const seedAuteurs: Item[] = auteurs.map((a) => ({
  id: a.slug,
  nom: a.nom,
  role: a.role,
  ville: a.ville,
  bio: a.bio,
  ventes: a.ventes,
}));

export const seedCategoriesMedia: Item[] = categoriesMedia.map((c) => ({
  id: c.toLowerCase(),
  nom: c,
  visibilite: "Publique",
}));

export const seedCategoriesLivres: Item[] = categoriesLivres.map((c) => ({
  id: c.toLowerCase().replace(/\s+/g, "-"),
  nom: c,
  visibilite: "Publique",
}));

export const seedCommandes: Item[] = commandes.map((c) => ({
  id: c.id,
  client: c.client,
  livre: c.livre,
  moyen: c.moyen,
  montant: c.montant,
  statut: c.statut,
  date: c.date,
}));

export const seedActualites: Item[] = [
  { id: "act-1", titre: "Itobe ouvre son studio audio", categorie: "Actualités", date: "2026-08-02", etat: "Publié" },
  { id: "act-2", titre: "Nouveau partenariat avec les libraires de Kinshasa", categorie: "Actualités", date: "2026-07-21", etat: "En revue" },
  { id: "act-3", titre: "Rentrée littéraire : le programme", categorie: "Culture", date: "2026-07-10", etat: "Brouillon" },
];

export const seedMedias: Item[] = [
  { id: "med-1", nom: "couverture-fleuve.jpg", type: "Image", poids: "480 Ko", date: "2026-07-28" },
  { id: "med-2", nom: "podcast-atelier-01.mp3", type: "Audio", poids: "18 Mo", date: "2026-07-05" },
  { id: "med-3", nom: "salon-2026.png", type: "Image", poids: "1,2 Mo", date: "2026-07-11" },
];

export const seedPaiements: Item[] = [
  { id: "PAY-9001", commande: "#10428", moyen: "Mobile Money", montant: 12, statut: "Payée", date: "2026-07-28" },
  { id: "PAY-9000", commande: "#10427", moyen: "Carte bancaire", montant: 12, statut: "Payée", date: "2026-07-27" },
  { id: "PAY-8999", commande: "#10426", moyen: "Mobile Money", montant: 21, statut: "En attente", date: "2026-07-27" },
  { id: "PAY-8998", commande: "#10422", moyen: "Carte bancaire", montant: 7, statut: "Échouée", date: "2026-07-23" },
];

export const seedCoupons: Item[] = [
  { id: "cpn-1", code: "RENTREE26", remise: 20, type: "Pourcentage", utilisations: 42, expiration: "2026-09-30", actif: true },
  { id: "cpn-2", code: "LECTEUR5", remise: 5, type: "Montant", utilisations: 118, expiration: "2026-12-31", actif: true },
  { id: "cpn-3", code: "SALON2026", remise: 15, type: "Pourcentage", utilisations: 7, expiration: "2026-07-15", actif: false },
];

export const seedPromotions: Item[] = [
  { id: "promo-1", nom: "Quinzaine de l'essai", cible: "Essai", remise: 25, debut: "2026-08-01", fin: "2026-08-15", actif: true },
  { id: "promo-2", nom: "Jeunesse à -30%", cible: "Jeunesse", remise: 30, debut: "2026-09-01", fin: "2026-09-20", actif: false },
];

export const seedUtilisateurs: Item[] = [
  { id: "usr-1", nom: "Nadia Kabeya", email: "nadia@itobe.cd", role: "lecteur", statut: "Actif", inscription: "2026-02-11" },
  { id: "usr-2", nom: "Serge Ilunga", email: "serge@itobe.cd", role: "editeur", statut: "Actif", inscription: "2025-11-04" },
  { id: "usr-3", nom: "Aline Mputu", email: "aline@itobe.cd", role: "admin", statut: "Actif", inscription: "2025-06-19" },
  { id: "usr-4", nom: "Joël Tshibangu", email: "joel@itobe.cd", role: "lecteur", statut: "Suspendu", inscription: "2026-05-30" },
];

export const seedCommentaires: Item[] = [
  { id: "cmt-1", auteur: "Ruth Kalala", contenu: "Article passionnant, merci !", cible: "L'édition numérique…", statut: "Publié", date: "2026-07-29" },
  { id: "cmt-2", auteur: "David Mukendi", contenu: "Des sources sur les chiffres ?", cible: "Le mobile money…", statut: "En attente", date: "2026-07-22" },
  { id: "cmt-3", auteur: "Anonyme", contenu: "Spam promotionnel", cible: "Salon du livre 2026", statut: "Rejeté", date: "2026-07-13" },
];

export const seedNewsletter: Item[] = [
  { id: "nl-1", email: "nadia@itobe.cd", segment: "Média", statut: "Abonné", date: "2026-03-02" },
  { id: "nl-2", email: "grace@itobe.cd", segment: "Édition", statut: "Abonné", date: "2026-04-18" },
  { id: "nl-3", email: "patrick@itobe.cd", segment: "Média", statut: "Désabonné", date: "2026-01-25" },
];
