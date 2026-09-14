import { AuteursApi, ArticlesApi, LivresApi, fetchAllPages } from "./api-client";
import { ARTICLE_COVER_FALLBACK, extractCoverSource, resolveMediaUrl } from "./media-url";

export type Article = {
  slug: string;
  titre: string;
  chapo: string;
  categorie: string;
  tags: string[];
  auteur: string;
  date: string;
  lecture: string;
  image: string;
  /** URL brute de couverture (http, data URL ou /uploads). */
  couverture?: string;
  fichiers?: { pdfUrl?: string; epubUrl?: string };
  populaire?: boolean;
  commentairesCount?: number;
  /** Corps HTML ou texte complet (distinct du résumé / chapô). */
  contenu?: string;
  youtube?: string;
  galerie?: string[];
  corps: string[];
};

export type Livre = {
  slug: string;
  titre: string;
  sousTitre?: string;
  auteur: string;
  isbn: string;
  resume: string;
  pages: number;
  langue: string;
  categorie: string;
  publication: string;
  formats: ("PDF" | "EPUB" | "Papier")[];
  prix: number;
  prixPapier?: number;
  promo?: number;
  stock: number;
  disponible: boolean;
  aLaUne?: boolean;
  couleur: string;
  /** URL ou data-URL de la couverture (prioritaire sur le dégradé). */
  couverture?: string;
  apercuPages: number;
  apercuPourcent: number;
  chapitres: { titre: string; pages: number[]; gratuit: boolean }[];
};

export type Auteur = {
  slug: string;
  nom: string;
  role: string;
  bio: string;
  ville: string;
  photo?: string;
  reseaux: { label: string; url: string }[];
  ventes: number;
  lectures: number;
  telechargements: number;
};

export const categoriesMedia = [
  "Actualités",
  "Culture",
  "Interviews",
  "Chroniques",
  "Économie",
  "Littérature",
];

export const categoriesLivres = [
  "Roman",
  "Essai",
  "Poésie",
  "Jeunesse",
  "Histoire",
  "Développement personnel",
];

const loremParas = (sujet: string) => [
  `${sujet} — À Kinshasa, la scène éditoriale se réinvente. Les maisons d'édition indépendantes multiplient les formats hybrides, entre papier soigné et diffusion numérique, pour rejoindre un lectorat plus jeune et connecté.`,
  `Le mouvement n'est pas seulement technologique. Il redéfinit la chaîne du livre : l'auteur devient éditeur de sa propre voix, le lecteur devient prescripteur, et la librairie s'étend jusqu'à l'écran du téléphone.`,
  `« Nous ne vendons pas des fichiers, nous transmettons des récits », résume un éditeur rencontré lors du dernier salon. Cette phrase pourrait tenir lieu de manifeste pour toute une génération.`,
  `Reste la question du modèle économique. Entre mobile money, abonnements et aperçus gratuits calibrés, les plateformes cherchent le juste équilibre entre accès et rémunération des créateurs.`,
];

const articlesSeed: Article[] = [
  {
    slug: "edition-numerique-nouvelle-generation",
    titre: "L'édition numérique face à une nouvelle génération de lecteurs",
    chapo:
      "Entre lecture mobile, aperçus gratuits et abonnements, les maisons d'édition repensent entièrement leur rapport au public.",
    categorie: "Littérature",
    tags: ["édition", "numérique", "lecteurs"],
    auteur: "christopher-bigos",
    date: "2026-07-28",
    lecture: "6 min",
    image: "linear-gradient(135deg, oklch(0.62 0.15 48), oklch(0.38 0.06 40))",
    populaire: true,
    corps: loremParas("Édition"),
  },
  {
    slug: "portrait-voix-montantes",
    titre: "Portrait : les voix montantes de la littérature congolaise",
    chapo:
      "Six auteurs, six manières d'écrire le présent. Rencontre avec une génération qui publie vite et loin.",
    categorie: "Interviews",
    tags: ["auteurs", "portrait"],
    auteur: "espoir-kakesa",
    date: "2026-07-24",
    lecture: "9 min",
    image: "linear-gradient(135deg, oklch(0.74 0.13 72), oklch(0.5 0.1 55))",
    populaire: true,
    corps: loremParas("Portrait"),
  },
  {
    slug: "mobile-money-culture",
    titre: "Le mobile money, moteur discret de l'économie culturelle",
    chapo:
      "Un paiement en trois secondes change la façon dont un livre se vend. Enquête sur une révolution invisible.",
    categorie: "Économie",
    tags: ["paiement", "économie"],
    auteur: "marie-lomba",
    date: "2026-07-19",
    lecture: "7 min",
    image: "linear-gradient(135deg, oklch(0.45 0.07 180), oklch(0.28 0.04 200))",
    corps: loremParas("Économie"),
  },
  {
    slug: "chronique-lire-autrement",
    titre: "Chronique : lire autrement, lire quand même",
    chapo: "Éloge de la lecture fragmentée, entre deux trajets et trois notifications.",
    categorie: "Chroniques",
    tags: ["lecture", "essai"],
    auteur: "christopher-bigos",
    date: "2026-07-15",
    lecture: "4 min",
    image: "linear-gradient(135deg, oklch(0.57 0.15 34), oklch(0.3 0.05 30))",
    corps: loremParas("Chronique"),
  },
  {
    slug: "salon-du-livre-2026",
    titre: "Salon du livre 2026 : ce qu'il faut retenir",
    chapo: "Trois jours, quarante éditeurs, une conviction : le catalogue est un média.",
    categorie: "Actualités",
    tags: ["salon", "événement"],
    auteur: "marie-lomba",
    date: "2026-07-11",
    lecture: "5 min",
    image: "linear-gradient(135deg, oklch(0.66 0.12 140), oklch(0.34 0.05 150))",
    populaire: true,
    corps: loremParas("Salon"),
  },
  {
    slug: "podcast-atelier-ecriture",
    titre: "Dans l'atelier d'écriture : le podcast",
    chapo: "Un format audio mensuel où les auteurs racontent la fabrique de leurs livres.",
    categorie: "Culture",
    tags: ["podcast", "atelier"],
    auteur: "espoir-kakesa",
    date: "2026-07-05",
    lecture: "3 min",
    image: "linear-gradient(135deg, oklch(0.52 0.12 300), oklch(0.3 0.05 290))",
    corps: loremParas("Atelier"),
  },
];

export const PUBLIC_DATA_EVENT = "itobe-public-data";

export const auteursSeed: Auteur[] = [
  {
    slug: "christopher-bigos",
    nom: "Christopher Bigo's",
    role: "Éditeur & essayiste",
    bio: "Fondateur d'Itobe. Il écrit sur la ville, la mémoire et les métiers du livre depuis quinze ans.\n\nBasé à Kinshasa, il consacre une part essentielle de son travail à documenter les mutations urbaines et la circulation des idées en Afrique centrale.",
    ville: "Kinshasa",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    reseaux: [
      { label: "X", url: "#" },
      { label: "LinkedIn", url: "#" },
    ],
    ventes: 3120,
    lectures: 18400,
    telechargements: 2410,
  },
  {
    slug: "marie-lomba",
    nom: "Marie Lomba",
    role: "Romancière & poétesse",
    bio: "Autrice de romans choraux et de poésie brève. Ses textes explorent la nuit urbaine et les silences familiaux.\n\nÉconomiste de formation, elle croise fiction et analyse des industries créatives africaines dans ses chroniques.",
    ville: "Lubumbashi",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    reseaux: [{ label: "Instagram", url: "#" }],
    ventes: 2240,
    lectures: 12980,
    telechargements: 1670,
  },
  {
    slug: "espoir-kakesa",
    nom: "Espoir Kakesa",
    role: "Journaliste & auteur",
    bio: "Journaliste culturel, critique littéraire et reporter d'investigation basé à Kinshasa.\n\nIl anime le podcast « Dans l'atelier d'écriture » et couvre la scène éditoriale congolaise. Ses enquêtes croisent culture, politique et société.\n\nAuteur d'essais sur l'action collective, il publie régulièrement des portraits d'auteurs et des chroniques sur la lecture numérique.",
    ville: "Kinshasa",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    reseaux: [
      { label: "X", url: "#" },
      { label: "Site", url: "#" },
    ],
    ventes: 1890,
    lectures: 9420,
    telechargements: 1330,
  },
];

export let auteurs: Auteur[] = auteursSeed;

const ADMIN_DATA_KEY = "itobe.admin.data.v5";

const lireDonneesAdmin = () => {
  if (typeof window === "undefined") return {} as Record<string, any>;
  try {
    const brut = window.localStorage.getItem(ADMIN_DATA_KEY);
    if (!brut) return {} as Record<string, any>;
    const parsed = JSON.parse(brut);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {} as Record<string, any>;
  }
};

const normaliserTags = (value: unknown) =>
  Array.isArray(value)
    ? value.map((v) => String(v)).filter(Boolean)
    : String(value ?? "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

const publicationParDefaut = () => new Date().toISOString().slice(0, 10);

const articleCoverFromRow = (row: Record<string, unknown>): { couverture?: string; image: string } => {
  const raw = extractCoverSource(String(row["couverture"] ?? row["image"] ?? ""));
  const couverture = resolveMediaUrl(raw);
  return {
    ...(couverture ? { couverture } : {}),
    image: couverture ?? ARTICLE_COVER_FALLBACK,
  };
};

const articleDepuisAdmin = (row: Record<string, unknown>, index: number): Article => ({
  slug: String(row["slug"] ?? row["id"] ?? `article-admin-${index}`),
  titre: String(row["titre"] ?? `Article ${index + 1}`),
  chapo: String(row["chapo"] ?? row["resume"] ?? ""),
  categorie: String(row["categorie"] ?? "Actualités"),
  tags: normaliserTags(row["tags"]),
  auteur: String(row["auteur"] ?? "espoir-kakesa"),
  date: String(row["date"] ?? row["datePublication"] ?? publicationParDefaut()),
  lecture: String(row["lecture"] ?? "5 min"),
  ...articleCoverFromRow(row),
  populaire: Boolean(row["populaire"] ?? row["aLaUne"] ?? false),
  ...(String(row["contenu"] ?? "").trim() ? { contenu: String(row["contenu"]) } : {}),
  ...(String(row["youtube"] ?? "").trim() ? { youtube: String(row["youtube"]) } : {}),
  ...(Array.isArray(row["galerie"]) && row["galerie"].length > 0
    ? { galerie: row["galerie"].map((src) => String(src)) }
    : {}),
  corps: Array.isArray(row["corps"]) && row["corps"].length > 0
    ? row["corps"].map((part) => String(part))
    : [],
});

const articlesPubliesAdmin = (): Article[] => {
  const admin = lireDonneesAdmin() as { articles?: Record<string, unknown>[] };
  const items = Array.isArray(admin.articles) ? admin.articles : [];
  return items
    .filter((row: Record<string, unknown>) => row["statut"] === "Publié" || row["etat"] === "Publié")
    .map((row: Record<string, unknown>, index: number) => articleDepuisAdmin(row, index));
};

export let articles: Article[] = [...articlesSeed, ...articlesPubliesAdmin()].filter(
  (article, index, arr) => arr.findIndex((entry) => entry.slug === article.slug) === index,
);

/** Catalogue public : uniquement les livres MongoDB (via API). */
export let livres: Livre[] = [];

const normaliserValeurApi = (payload: unknown): any[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record["data"])) return record["data"] as any[];
    if (Array.isArray(record["articles"])) return record["articles"] as any[];
    if (Array.isArray(record["livres"])) return record["livres"] as any[];
    if (Array.isArray(record["auteurs"])) return record["auteurs"] as any[];
  }
  return [];
};

const normaliserArticleApi = (entry: any): Article => {
  memoriserAuteurPeuple(entry?.auteur);
  const raw = extractCoverSource(entry?.couverture ?? entry?.image);
  const couverture = resolveMediaUrl(raw);

  return {
  slug: String(entry?.slug ?? entry?._id ?? "article"),
  titre: String(entry?.titre ?? "Article"),
  chapo: String(entry?.chapo ?? entry?.resume ?? ""),
  categorie: String(entry?.categorie?.nom ?? entry?.categorie ?? "Actualités"),
  tags: Array.isArray(entry?.tags) ? entry.tags.map((tag: unknown) => String(tag)) : [],
  auteur: String(entry?.auteur?.slug ?? entry?.auteur ?? "espoir-kakesa"),
  date: String(entry?.datePublication ?? entry?.date ?? publicationParDefaut()),
  lecture: String(entry?.lecture ?? "5 min"),
  ...(couverture ? { couverture } : {}),
  image: couverture ?? ARTICLE_COVER_FALLBACK,
  populaire: Boolean(entry?.populaire ?? entry?.aLaUne ?? false),
  ...(String(entry?.contenu ?? "").trim() ? { contenu: String(entry.contenu) } : {}),
  ...(String(entry?.youtube ?? "").trim() ? { youtube: String(entry.youtube).trim() } : {}),
  ...(Array.isArray(entry?.galerie) && entry.galerie.length > 0
    ? { galerie: entry.galerie.map((src: unknown) => String(src)) }
    : {}),
  corps: Array.isArray(entry?.corps) && entry.corps.length > 0
    ? entry.corps.map((part: unknown) => String(part))
    : [],
  };
};

function memoriserAuteurPeuple(raw: unknown) {
  if (!raw || typeof raw !== "object" || !("nom" in raw || "photo" in raw || "slug" in raw)) return;
  const auteur = normaliserAuteurApi(raw);
  const idx = auteurs.findIndex((a) => a.slug === auteur.slug);
  if (idx >= 0) auteurs[idx] = { ...auteurs[idx], ...auteur };
  else auteurs.push(auteur);
}

const normaliserLivreApi = (entry: any): Livre => {
  memoriserAuteurPeuple(entry?.auteur);
  const promoValue =
    entry?.promo !== undefined && entry?.promo !== null && Number(entry.promo) > 0 ? Number(entry.promo) : undefined;

  return {
    slug: String(entry?.slug ?? entry?._id ?? "livre"),
    titre: String(entry?.titre ?? "Livre"),
    ...(typeof entry?.sousTitre === "string" ? { sousTitre: entry.sousTitre } : {}),
    auteur: String(entry?.auteur?.slug ?? entry?.auteur ?? "espoir-kakesa"),
    isbn: String(entry?.isbn ?? ""),
    resume: String(entry?.resume ?? ""),
    pages: Number(entry?.pages ?? 200),
    langue: String(entry?.langue ?? "Français"),
    categorie: String(entry?.categorie?.nom ?? entry?.categorie ?? "Roman"),
    publication: String(entry?.publication ?? entry?.datePublication ?? publicationParDefaut()),
    formats: Array.isArray(entry?.formats)
      ? (entry.formats.filter((val: unknown) => ["PDF", "EPUB", "Papier"].includes(String(val))) as Array<"PDF" | "EPUB" | "Papier">)
      : ["PDF"],
    prix: Number(entry?.prix ?? 0),
    ...(Number(entry?.prixPapier) > 0 ? { prixPapier: Number(entry.prixPapier) } : {}),
    ...(promoValue !== undefined ? { promo: promoValue } : {}),
    stock: Number(entry?.stock ?? 0),
    disponible: Boolean(entry?.disponible ?? true),
    aLaUne: Boolean(entry?.aLaUne ?? false),
    couleur: String(entry?.couleur ?? "linear-gradient(160deg, oklch(0.62 0.15 48), oklch(0.3 0.05 40))"),
    ...(typeof entry?.couverture === "string" ? { couverture: entry.couverture } : {}),
    ...(entry?.fichiers
      ? {
          fichiers: {
            pdfUrl: String(entry.fichiers.pdfUrl ?? ""),
            epubUrl: String(entry.fichiers.epubUrl ?? ""),
          },
        }
      : {}),
    apercuPages: Number(entry?.apercuPages ?? 10),
    apercuPourcent: Number(entry?.apercuPourcent ?? 10),
    chapitres: Array.isArray(entry?.chapitres)
      ? entry.chapitres.map((chapitre: any) => ({
          titre: String(chapitre?.titre ?? "Chapitre"),
          pages: Array.isArray(chapitre?.pages) ? chapitre.pages.map((page: unknown) => Number(page)) : [],
          gratuit: Boolean(chapitre?.gratuit ?? false),
        }))
      : [],
  };
};

const normaliserAuteurApi = (entry: any): Auteur => {
  const photo = resolveMediaUrl(entry?.photo ?? entry?.image ?? entry?.avatar);
  return {
  slug: String(entry?.slug ?? entry?._id ?? "auteur"),
  nom: String(entry?.nom ?? "Auteur"),
  role: String(entry?.role ?? "Auteur"),
  bio: String(entry?.bio ?? entry?.biographie ?? ""),
  ville: String(entry?.ville ?? ""),
  ...(photo ? { photo } : {}),
  reseaux: Array.isArray(entry?.reseaux)
    ? entry.reseaux.map((item: any) => ({ label: String(item?.label ?? "Link"), url: String(item?.url ?? "#") }))
    : [],
  ventes: Number(entry?.ventes ?? 0),
  lectures: Number(entry?.lectures ?? 0),
  telechargements: Number(entry?.telechargements ?? 0),
};
};

export const hydratePublicData = async () => {
  if (typeof window === "undefined") return;

  try {
    const [articlesApi, livresApi, auteursApi] = await Promise.all([
      fetchAllPages((page, limit) => ArticlesApi.getAll({ page, limit })),
      LivresApi.fetchAll(),
      fetchAllPages((page, limit) => AuteursApi.getAll({ page, limit })),
    ]);

    const articlesLive = normaliserValeurApi(articlesApi).map(normaliserArticleApi);
    const livresLive = (Array.isArray(livresApi) ? livresApi : normaliserValeurApi(livresApi)).map(
      normaliserLivreApi,
    );
    const auteursLive = normaliserValeurApi(auteursApi).map(normaliserAuteurApi);

    articles = [...articlesLive, ...articlesPubliesAdmin()].filter(
      (article, index, arr) => arr.findIndex((entry) => entry.slug === article.slug) === index,
    );
    livres = livresLive;
    auteurs = auteursLive.length > 0 ? auteursLive : auteursSeed;
    window.dispatchEvent(new Event(PUBLIC_DATA_EVENT));
  } catch {
    /* API indisponible : catalogue livres vide */
  }
};

if (typeof window !== "undefined") {
  void hydratePublicData();
}

export const getAuteur = (slug: string) => auteurs.find((a) => a.slug === slug);
export const nomAuteur = (slug: string) => getAuteur(slug)?.nom ?? slug;
export const getLivre = (slug: string) => livres.find((l) => l.slug === slug);

/** Charge un livre depuis l'API et met à jour le cache local. */
export async function fetchLivreBySlug(slug: string): Promise<Livre | null> {
  const cached = getLivre(slug);
  if (cached) return cached;

  try {
    const res = await LivresApi.getBySlug(slug);
    const entry = res?.data?.livre ?? res?.livre ?? res?.data ?? null;
    if (!entry) return null;
    const livre = normaliserLivreApi(entry);
    const idx = livres.findIndex((l) => l.slug === livre.slug);
    if (idx >= 0) livres[idx] = livre;
    else livres.push(livre);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(PUBLIC_DATA_EVENT));
    }
    return livre;
  } catch {
    return null;
  }
}
export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export const prixAffiche = (l: Livre) => `${(l.promo ?? l.prix).toFixed(2)} $`;

// Bibliothèque de démonstration
export const bibliotheque = {
  achetes: ["le-fleuve-et-la-page", "grammaire-du-courage"],
  favoris: ["nuit-blanche-a-matonge", "poemes-du-quatrieme-jour"],
  telecharges: ["grammaire-du-courage"],
  progression: {
    "le-fleuve-et-la-page": 46,
    "grammaire-du-courage": 78,
    "nuit-blanche-a-matonge": 12,
  } as Record<string, number>,
};

export const statsDashboard = [
  { label: "Articles publiés", valeur: "128", delta: "+12 ce mois" },
  { label: "Livres au catalogue", valeur: "36", delta: "+3 ce mois" },
  { label: "Ventes", valeur: "1 284", delta: "+8,4 %" },
  { label: "Revenus", valeur: "18 420 $", delta: "+11,2 %" },
  { label: "Lectures en ligne", valeur: "42 108", delta: "+6,1 %" },
  { label: "Téléchargements", valeur: "9 736", delta: "+4,8 %" },
  { label: "Visiteurs", valeur: "96 540", delta: "+15,3 %" },
  { label: "Abonnés newsletter", valeur: "7 812", delta: "+248" },
];

export const serieMensuelle = [
  { mois: "Jan", revenus: 8200, ventes: 420, lectures: 2100, telechargements: 640 },
  { mois: "Fév", revenus: 9400, ventes: 480, lectures: 2450, telechargements: 710 },
  { mois: "Mar", revenus: 11200, ventes: 560, lectures: 3010, telechargements: 820 },
  { mois: "Avr", revenus: 10400, ventes: 520, lectures: 3320, telechargements: 780 },
  { mois: "Mai", revenus: 13800, ventes: 690, lectures: 3980, telechargements: 940 },
  { mois: "Juin", revenus: 15600, ventes: 760, lectures: 4310, telechargements: 1020 },
  { mois: "Juil", revenus: 18420, ventes: 880, lectures: 5120, telechargements: 1180 },
];

// Texte factice paginé pour le Reader
export const pageTexte = (livre: Livre, page: number) => {
  const base = [
    `Le matin se levait lentement sur le fleuve, et la ville, encore engourdie, semblait relire ses propres pages. ${livre.titre} — page ${page}.`,
    `On entendait au loin le bruit des presses, ce battement régulier qui rythmait la vie du quartier depuis des décennies. Chaque feuille imprimée portait une promesse : celle d'être lue un jour, par quelqu'un, quelque part.`,
    `« Un livre n'appartient jamais tout à fait à celui qui l'écrit », disait-elle en refermant le cahier. Cette phrase revenait souvent, comme un refrain nécessaire.`,
    `Puis vint le temps des écrans. On crut d'abord que le papier disparaîtrait ; il changea seulement de voisinage. Le récit, lui, continua son chemin, indifférent au support qui le portait.`,
    `Il faudrait un jour raconter cela correctement : la patience des correcteurs, l'odeur de l'encre, les nuits blanches avant le bon à tirer, et cette joie brève, presque secrète, du premier exemplaire tenu en main.`,
  ];
  return base;
};
