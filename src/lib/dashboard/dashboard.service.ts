/**
 * DashboardService — couche métier (admin mock, lecteur via API).
 */
import {
  articles,
  auteurs,
  categoriesLivres,
  categoriesMedia,
  livres,
  nomAuteur,
  serieMensuelle,
} from "@/lib/data";
import { commandes } from "@/lib/admin-data";
import { lireSession } from "@/lib/auth";
import { BibliothequeApi, CommandesApi, LivresApi, getToken } from "@/lib/api-client";
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

const COULEUR_DEFAUT =
  "linear-gradient(160deg, oklch(0.62 0.15 48), oklch(0.3 0.05 40))";

function formaterDate(v: string | Date | undefined): string {
  if (!v) return "Récemment";
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return "Récemment";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function formaterCommande(c: any) {
  const livre = c.livre;
  return {
    id: c.reference || c._id || "",
    slug: livre?.slug || "",
    titre: c.livreTitre || livre?.titre || "Livre",
    format: c.format || "EPUB + PDF",
    moyen: c.moyen || "Mobile Money",
    reference: c.reference || "",
    montant: c.montant ?? 0,
    statut: c.statut || "En attente",
    date: formaterDate(c.date),
    motif: c.motif,
  };
}

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

async function chargerCatalogueApi() {
  try {
    const liste = await LivresApi.fetchAll();
    return liste.map((l: any) => ({
      slug: l.slug || "",
      titre: l.titre || "",
      couleur: l.couleur || COULEUR_DEFAUT,
    }));
  } catch {
    return [];
  }
}

function payloadLecteurVide(prenom: string, catalogue: { slug: string; titre: string; couleur: string }[]): DashboardLecteurPayload {
  return {
    prenom,
    continuer: [],
    bibliotheque: [],
    favoris: [],
    derniersAchats: [],
    historique: [],
    recommandations: catalogue.slice(0, 3),
    nouveautes: catalogue.slice(0, 3),
    tempsLectureTotal: "0 min",
    telechargements: [],
    marquePages: [],
    commandes: [],
  };
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
    const session = lireSession();
    const prenom = session?.prenom || session?.nom || "Lecteur";
    const catalogueDispo = await chargerCatalogueApi();

    if (!getToken()) {
      return payloadLecteurVide(prenom, catalogueDispo);
    }

    try {
      const [bibRes, cmdRes] = await Promise.all([
        BibliothequeApi.getLibrary(),
        CommandesApi.getMine().catch(() => null),
      ]);

      const biblio = bibRes?.data ?? bibRes;
      if (!biblio) {
        return payloadLecteurVide(prenom, catalogueDispo);
      }

      const mapLivre = (l: any) => ({
        slug: l?.slug || "",
        titre: l?.titre || "",
        couleur: l?.couleur || COULEUR_DEFAUT,
      });

      const bibliotheque = (biblio.achetes || []).map(mapLivre).filter((l: any) => l.slug);
      const favoris = (biblio.favoris || []).map(mapLivre).filter((l: any) => l.slug);
      const telechargements = (biblio.telecharges || []).map((t: any) => ({
        slug: t?.slug || "",
        titre: t?.titre || "",
      })).filter((t: any) => t.slug);

      const continuer = (biblio.enCours || []).map((ec: any) => ({
        slug: ec.slug || "",
        titre: ec.titre || "",
        progression: ec.pourcentage || 0,
        couleur: ec.couleur || COULEUR_DEFAUT,
      })).filter((c: any) => c.slug);

      const historique = (biblio.historiqueLecture || biblio.enCours || []).map((h: any) => ({
        slug: h.slug || "",
        titre: h.titre || "",
        date: formaterDate(h.date),
      })).filter((h: any) => h.slug);

      const derniersAchats = (biblio.achetes || [])
        .map((a: any) => ({
          slug: a.slug || "",
          titre: a.titre || "",
          date: formaterDate(a.dateAchat),
        }))
        .filter((a: any) => a.slug)
        .sort((a: any, b: any) => (a.date < b.date ? 1 : -1));

      const marquePages = (biblio.marquePages || [])
        .map((m: any) => ({
          slug: m.livre?.slug || "",
          titre: m.livre?.titre || "Livre",
          page: m.page || 1,
        }))
        .filter((m: any) => m.slug);

      const commandesUtilisateur = Array.isArray(cmdRes?.data)
        ? cmdRes.data.map(formaterCommande)
        : Array.isArray(cmdRes)
          ? cmdRes.map(formaterCommande)
          : [];

      const achetesSlugs = new Set(bibliotheque.map((a: any) => a.slug));
      const minutesEstimes = continuer.reduce((s: number, c: any) => s + Math.round(c.progression * 0.45), 0);

      return {
        prenom,
        continuer,
        bibliotheque,
        favoris,
        derniersAchats: derniersAchats.length > 0 ? derniersAchats : commandesUtilisateur.slice(0, 5).map((c) => ({
          slug: c.slug,
          titre: c.titre,
          date: c.date,
        })),
        historique,
        recommandations: catalogueDispo.filter((l) => !achetesSlugs.has(l.slug)).slice(0, 3),
        nouveautes: catalogueDispo.slice(0, 3),
        tempsLectureTotal: minutesEstimes > 0 ? `${minutesEstimes} min` : "0 min",
        telechargements,
        marquePages,
        commandes: commandesUtilisateur,
      };
    } catch (e) {
      console.warn("[Lecteur Dashboard] Impossible de charger la bibliothèque API :", e);
      return payloadLecteurVide(prenom, catalogueDispo);
    }
  },
};

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
