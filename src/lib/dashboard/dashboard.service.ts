/**
 * DashboardService — couche métier mock (front).
 * Remplaçable plus tard par des appels API (DashboardController).
 */
import {
  articles,
  auteurs,
  bibliotheque,
  categoriesLivres,
  categoriesMedia,
  getLivre,
  livres,
  nomAuteur,
  serieMensuelle,
} from "@/lib/data";
import { commandes } from "@/lib/admin-data";
import type {
  ActiviteItem,
  AlerteItem,
  ArticleDashboard,
  DashboardAdminPayload,
  DashboardEditeurPayload,
  DashboardLecteurPayload,
  LivreDashboard,
  PeriodeFiltre,
  PointSerie,
  VueEnsemble,
} from "./types";

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

function enrichirLivres(): LivreDashboard[] {
  return livres.map((l, i) => {
    const auteur = auteurs.find((a) => a.slug === l.auteur);
    const ventes = Math.max(40, Math.round((auteur?.ventes ?? 500) / (livres.filter((x) => x.auteur === l.auteur).length || 1)));
    return {
      slug: l.slug,
      titre: l.titre,
      auteur: nomAuteur(l.auteur),
      prix: l.promo ?? l.prix,
      statut: l.stock === 0 ? "Épuisé" : l.disponible ? "Publié" : "Brouillon",
      lectures: Math.round((auteur?.lectures ?? 1000) / 2 - i * 120),
      telechargements: Math.round((auteur?.telechargements ?? 200) / 2 - i * 30),
      ventes: ventes - i * 18,
      revenus: (ventes - i * 18) * (l.promo ?? l.prix),
      couleur: l.couleur,
      stock: l.stock,
      categorie: l.categorie,
      formats: l.formats,
    };
  });
}

function enrichirArticles(): ArticleDashboard[] {
  return articles.map((a, i) => ({
    slug: a.slug,
    titre: a.titre,
    categorie: a.categorie,
    auteur: nomAuteur(a.auteur),
    date: a.date,
    vues: a.populaire ? 9800 - i * 900 : 2400 - i * 280,
    statut: i === articles.length - 1 ? "Brouillon" : i === articles.length - 2 ? "Programmé" : "Publié",
    image: a.image,
    tempsLecture: a.lecture,
    commentaires: a.populaire ? 48 - i * 6 : 12 - i,
  }));
}

function construireVue(livresD: LivreDashboard[], articlesD: ArticleDashboard[]): VueEnsemble {
  const payees = commandes.filter((c) => c.statut === "Payée");
  const echoues = commandes.filter((c) => c.statut === "Échouée");
  const revenusTotaux = payees.reduce((s, c) => s + c.montant, 0);

  return {
    media: {
      articles: articlesD.length,
      publies: articlesD.filter((a) => a.statut === "Publié").length,
      brouillons: articlesD.filter((a) => a.statut === "Brouillon").length,
      programmes: articlesD.filter((a) => a.statut === "Programmé").length,
      categories: categoriesMedia.length,
      commentaires: articlesD.reduce((s, a) => s + a.commentaires, 0),
      vues: articlesD.reduce((s, a) => s + a.vues, 0),
      tempsLectureMoyen: "4 min 20 s",
    },
    edition: {
      livres: livresD.length,
      publies: livresD.filter((l) => l.statut === "Publié" || l.statut === "Épuisé").length,
      numeriques: livres.filter((l) => l.formats.some((f) => f === "PDF" || f === "EPUB")).length,
      physiques: livres.filter((l) => l.formats.includes("Papier")).length,
      brouillons: livresD.filter((l) => l.statut === "Brouillon").length,
      archives: 0,
      promotions: livres.filter((l) => l.promo).length,
    },
    utilisateurs: {
      total: 1842,
      lecteurs: 1760,
      editeurs: 12,
      nouveaux: 48,
    },
    paiements: {
      revenusAujourdhui: 84,
      revenusMois: revenusTotaux * 12,
      revenusTotaux: revenusTotaux * 48,
      commandes: commandes.length,
      reussis: payees.length,
      echoues: echoues.length,
    },
  };
}

function seriesPourPeriode(periode: PeriodeFiltre): PointSerie[] {
  const base = serieMensuelle.map((m) => ({
    label: m.mois,
    revenus: m.revenus,
    ventes: m.ventes,
    utilisateurs: Math.round(m.ventes * 1.8),
    lectures: m.lectures,
    telechargements: m.telechargements,
    articles: 4 + Math.round(m.ventes / 200),
    livres: 1 + Math.round(m.ventes / 400),
    newsletter: 80 + Math.round(m.ventes / 10),
  }));

  switch (periode) {
    case "aujourd-hui":
      return [
        {
          label: "Auj.",
          revenus: 84,
          ventes: 7,
          utilisateurs: 12,
          lectures: 186,
          telechargements: 42,
          articles: 0,
          livres: 0,
          newsletter: 9,
        },
      ];
    case "7j":
      return base.slice(-1).flatMap((m) =>
        ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((j, i) => ({
          label: j,
          revenus: Math.round(m.revenus / 7 + i * 40),
          ventes: Math.round(m.ventes / 7 + i),
          utilisateurs: Math.round(m.utilisateurs / 7 + i * 2),
          lectures: Math.round(m.lectures / 7 + i * 20),
          telechargements: Math.round(m.telechargements / 7 + i * 4),
          articles: i % 3 === 0 ? 1 : 0,
          livres: i === 4 ? 1 : 0,
          newsletter: Math.round(m.newsletter / 7),
        })),
      );
    case "30j":
    case "3m":
      return base.slice(-3);
    case "6m":
      return base.slice(-6);
    case "annee":
    case "perso":
    default:
      return base;
  }
}

function activites(): ActiviteItem[] {
  return [
    { id: "1", type: "utilisateur", titre: "Nouvel utilisateur", detail: "Ruth Kalala s'est inscrite", date: "Il y a 12 min" },
    { id: "2", type: "commande", titre: "Nouvelle commande", detail: "#10428 — Le Fleuve et la Page", date: "Il y a 28 min" },
    { id: "3", type: "paiement", titre: "Paiement réussi", detail: "12 $ via Mobile Money", date: "Il y a 30 min" },
    { id: "4", type: "article", titre: "Nouvel article", detail: "L'édition numérique face à une nouvelle génération", date: "Il y a 2 h" },
    { id: "5", type: "livre", titre: "Nouveau livre", detail: "Le cartable de Kimia publié", date: "Il y a 5 h" },
    { id: "6", type: "commentaire", titre: "Nouveau commentaire", detail: "Sur « Grammaire du courage »", date: "Hier" },
    { id: "7", type: "newsletter", titre: "Inscription Newsletter", detail: "+14 abonnés aujourd'hui", date: "Hier" },
  ];
}

function alertes(livresD: LivreDashboard[]): AlerteItem[] {
  const items: AlerteItem[] = [];
  livresD.filter((l) => l.stock === 0).forEach((l) =>
    items.push({ id: `stock-${l.slug}`, niveau: "critique", message: `Rupture de stock : ${l.titre}`, lien: "/admin/livres" }),
  );
  commandes.filter((c) => c.statut === "Échouée").forEach((c) =>
    items.push({ id: `pay-${c.id}`, niveau: "critique", message: `Paiement échoué ${c.id}`, lien: "/admin/paiements" }),
  );
  commandes.filter((c) => c.statut === "En attente").forEach((c) =>
    items.push({ id: `att-${c.id}`, niveau: "attention", message: `Commande en attente ${c.id}`, lien: "/admin/commandes" }),
  );
  items.push({ id: "brouillon", niveau: "attention", message: "1 brouillon article non publié depuis 7 jours", lien: "/admin/articles" });
  items.push({ id: "promo", niveau: "info", message: "2 promotions actives à surveiller", lien: "/admin/promotions" });
  return items;
}

export const DashboardService = {
  async getAdminDashboard(periode: PeriodeFiltre = "annee"): Promise<DashboardAdminPayload> {
    await delay();
    const derniersLivres = enrichirLivres();
    const derniersArticles = enrichirArticles();
    const vue = construireVue(derniersLivres, derniersArticles);

    const formats: Record<string, number> = {};
    livres.forEach((l) => l.formats.forEach((f) => { formats[f] = (formats[f] ?? 0) + 1; }));
    const cats: Record<string, number> = {};
    livres.forEach((l) => { cats[l.categorie] = (cats[l.categorie] ?? 0) + 1; });

    return {
      vue,
      series: seriesPourPeriode(periode),
      activites: activites(),
      commandes: commandes.slice(0, 6).map((c) => ({
        id: c.id,
        client: c.client,
        livre: c.livre,
        prix: c.montant,
        paiement: c.moyen,
        date: c.date,
        statut: c.statut,
      })),
      derniersLivres: derniersLivres.slice(0, 6),
      derniersArticles: derniersArticles.slice(0, 6),
      topVentes: [...derniersLivres].sort((a, b) => b.ventes - a.ventes).slice(0, 10),
      articlesPopulaires: [...derniersArticles].sort((a, b) => b.vues - a.vues).slice(0, 6),
      auteursPopulaires: auteurs.map((a) => ({
        slug: a.slug,
        nom: a.nom,
        livres: livres.filter((l) => l.auteur === a.slug).length,
        revenus: a.ventes * 11.5,
        lectures: a.lectures,
        telechargements: a.telechargements,
      })),
      alertes: alertes(derniersLivres),
      repartitionFormats: Object.entries(formats).map(([nom, valeur]) => ({ nom, valeur })),
      repartitionCategories: Object.entries(cats).map(([nom, valeur]) => ({ nom, valeur })),
    };
  },

  async getEditeurDashboard(periode: PeriodeFiltre = "annee"): Promise<DashboardEditeurPayload> {
    await delay();
    const livresD = enrichirLivres();
    return {
      publies: livresD.filter((l) => l.statut === "Publié" || l.statut === "Épuisé").length,
      brouillons: livresD.filter((l) => l.statut === "Brouillon").length,
      archives: 0,
      revenus: livresD.reduce((s, l) => s + l.revenus, 0),
      lectures: livresD.reduce((s, l) => s + l.lectures, 0),
      telechargements: livresD.reduce((s, l) => s + l.telechargements, 0),
      favoris: 326,
      dernieresVentes: commandes
        .filter((c) => c.statut === "Payée")
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          livre: c.livre,
          client: c.client,
          montant: c.montant,
          date: c.date,
        })),
      series: seriesPourPeriode(periode),
      livres: livresD,
    };
  },

  async getLecteurDashboard(): Promise<DashboardLecteurPayload> {
    await delay();
    const mapLivre = (slug: string) => {
      const l = getLivre(slug)!;
      return { slug, titre: l.titre, couleur: l.couleur };
    };
    return {
      prenom: "Nadia",
      continuer: Object.entries(bibliotheque.progression)
        .filter(([, p]) => p > 0 && p < 100)
        .map(([slug, progression]) => {
          const l = getLivre(slug)!;
          return { slug, titre: l.titre, progression, couleur: l.couleur };
        }),
      bibliotheque: bibliotheque.achetes.map(mapLivre),
      favoris: bibliotheque.favoris.map(mapLivre),
      derniersAchats: bibliotheque.achetes.map((slug) => ({
        slug,
        titre: getLivre(slug)!.titre,
        date: "2026-07-10",
      })),
      historique: Object.keys(bibliotheque.progression).map((slug) => ({
        slug,
        titre: getLivre(slug)!.titre,
        date: "2026-07-28",
      })),
      recommandations: livres
        .filter((l) => !bibliotheque.achetes.includes(l.slug))
        .slice(0, 3)
        .map((l) => ({ slug: l.slug, titre: l.titre, couleur: l.couleur })),
      nouveautes: livres.slice(0, 3).map((l) => ({ slug: l.slug, titre: l.titre, couleur: l.couleur })),
      tempsLectureTotal: "14 h 32 min",
      telechargements: bibliotheque.telecharges.map((slug) => ({
        slug,
        titre: getLivre(slug)!.titre,
      })),
      marquePages: [
        { slug: "le-fleuve-et-la-page", titre: "Le Fleuve et la Page", page: 128 },
        { slug: "grammaire-du-courage", titre: "Grammaire du courage", page: 64 },
      ],
    };
  },
};

// Réexport pour analytics spécialisés (architecture évolutive)
export const AnalyticsService = {
  getSeries: (periode: PeriodeFiltre) => seriesPourPeriode(periode),
  getCategories: () => categoriesLivres,
};

export const RevenueService = {
  totaux: () =>
    commandes
      .filter((c) => c.statut === "Payée")
      .reduce((s, c) => s + c.montant, 0),
};

export const OrdersService = {
  list: () => commandes,
  pending: () => commandes.filter((c) => c.statut === "En attente"),
};
