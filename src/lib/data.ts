// Données de démonstration (front uniquement) avec Hydratation depuis l'API réel en fallback.
import { AuteursApi, ArticlesApi, LivresApi } from "./api-client";
import { faussesCouvertures } from "./fausses-couvertures";

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
  populaire?: boolean;
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

const chapitres = (n: number, pages: number) =>
  Array.from({ length: n }, (_, i) => ({
    titre:
      ["Ouverture", "Le seuil", "Les voix", "La fracture", "Retour", "Le fleuve", "Épilogue"][i % 7] +
      ` — chapitre ${i + 1}`,
    pages: Array.from(
      { length: Math.round(pages / n) },
      (_, p) => Math.round((pages / n) * i) + p + 1,
    ),
    gratuit: i < 2,
  }));

const livresSeed: Livre[] = [
  {
    slug: "le-fleuve-et-la-page",
    titre: "Le Fleuve et la Page",
    sousTitre: "Récits d'une ville qui écrit",
    auteur: "christopher-bigos",
    isbn: "978-2-1234-5680-1",
    resume:
      "Une traversée littéraire de Kinshasa, de ses ateliers d'écriture à ses librairies de fortune. Un livre qui écoute la ville autant qu'il la raconte.",
    pages: 248,
    langue: "Français",
    categorie: "Essai",
    publication: "2026-05-12",
    formats: ["PDF", "EPUB", "Papier"],
    prix: 18,
    promo: 12,
    stock: 42,
    disponible: true,
    aLaUne: true,
    couleur: "linear-gradient(160deg, oklch(0.62 0.15 48), oklch(0.3 0.05 40))",
    couverture: faussesCouvertures["le-fleuve-et-la-page"],
    apercuPages: 24,
    apercuPourcent: 10,
    chapitres: chapitres(7, 248),
  },
  {
    slug: "nuit-blanche-a-matonge",
    titre: "Nuit blanche à Matonge",
    sousTitre: "Roman",
    auteur: "marie-lomba",
    isbn: "978-2-1234-5681-8",
    resume:
      "Trois personnages, une nuit, un quartier qui ne dort jamais. Un roman choral sur l'amitié et les promesses tenues de justesse.",
    pages: 312,
    langue: "Français",
    categorie: "Roman",
    publication: "2026-03-02",
    formats: ["PDF", "EPUB"],
    prix: 15,
    stock: 0,
    disponible: true,
    couleur: "linear-gradient(160deg, oklch(0.42 0.1 265), oklch(0.22 0.04 270))",
    couverture: faussesCouvertures["nuit-blanche-a-matonge"],
    apercuPages: 18,
    apercuPourcent: 6,
    chapitres: chapitres(6, 312),
  },
  {
    slug: "grammaire-du-courage",
    titre: "Grammaire du courage",
    auteur: "espoir-kakesa",
    isbn: "978-2-1234-5682-5",
    resume:
      "Un manuel intime pour celles et ceux qui commencent. Vingt chapitres courts, vingt manières de tenir debout.",
    pages: 180,
    langue: "Français",
    categorie: "Développement personnel",
    publication: "2026-01-20",
    formats: ["PDF", "EPUB", "Papier"],
    prix: 12,
    stock: 120,
    disponible: true,
    couleur: "linear-gradient(160deg, oklch(0.74 0.13 72), oklch(0.42 0.07 60))",
    couverture: faussesCouvertures["grammaire-du-courage"],
    apercuPages: 20,
    apercuPourcent: 12,
    chapitres: chapitres(5, 180),
  },
  {
    slug: "poemes-du-quatrieme-jour",
    titre: "Poèmes du quatrième jour",
    auteur: "marie-lomba",
    isbn: "978-2-1234-5683-2",
    resume: "Recueil de poésie autour de l'attente, du fleuve et des départs.",
    pages: 96,
    langue: "Français",
    categorie: "Poésie",
    publication: "2025-11-08",
    formats: ["PDF", "Papier"],
    prix: 9,
    stock: 8,
    disponible: true,
    couleur: "linear-gradient(160deg, oklch(0.57 0.15 34), oklch(0.28 0.05 30))",
    couverture: faussesCouvertures["poemes-du-quatrieme-jour"],
    apercuPages: 10,
    apercuPourcent: 10,
    chapitres: chapitres(4, 96),
  },
  {
    slug: "histoire-des-presses",
    titre: "Histoire des presses africaines",
    sousTitre: "1950–2025",
    auteur: "christopher-bigos",
    isbn: "978-2-1234-5684-9",
    resume:
      "Soixante-quinze ans d'imprimerie, de censure et de résistance éditoriale, racontés par les archives.",
    pages: 420,
    langue: "Français",
    categorie: "Histoire",
    publication: "2025-09-15",
    formats: ["PDF", "EPUB", "Papier"],
    prix: 26,
    promo: 21,
    stock: 15,
    disponible: true,
    couleur: "linear-gradient(160deg, oklch(0.38 0.06 150), oklch(0.2 0.03 160))",
    couverture: faussesCouvertures["histoire-des-presses"],
    apercuPages: 30,
    apercuPourcent: 7,
    chapitres: chapitres(7, 420),
  },
  {
    slug: "le-cartable-de-kimia",
    titre: "Le cartable de Kimia",
    auteur: "espoir-kakesa",
    isbn: "978-2-1234-5685-6",
    resume: "Un conte illustré pour les 7-11 ans, sur l'école, l'amitié et les grands départs.",
    pages: 64,
    langue: "Français",
    categorie: "Jeunesse",
    publication: "2025-06-30",
    formats: ["PDF", "Papier"],
    prix: 7,
    stock: 60,
    disponible: true,
    couleur: "linear-gradient(160deg, oklch(0.7 0.14 160), oklch(0.36 0.06 165))",
    couverture: faussesCouvertures["le-cartable-de-kimia"],
    apercuPages: 8,
    apercuPourcent: 12,
    chapitres: chapitres(4, 64),
  },
];

export const auteursSeed: Auteur[] = [
  {
    slug: "christopher-bigos",
    nom: "Christopher Bigo's",
    role: "Éditeur & essayiste",
    bio: "Fondateur d'Itobe. Il écrit sur la ville, la mémoire et les métiers du livre depuis quinze ans.",
    ville: "Kinshasa",
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
    bio: "Autrice de romans choraux et de poésie brève. Ses textes explorent la nuit urbaine et les silences familiaux.",
    ville: "Lubumbashi",
    reseaux: [{ label: "Instagram", url: "#" }],
    ventes: 2240,
    lectures: 12980,
    telechargements: 1670,
  },
  {
    slug: "espoir-kakesa",
    nom: "Espoir Kakesa",
    role: "Journaliste & auteur",
    bio: "Journaliste culturel, il anime le podcast « Dans l'atelier d'écriture » et publie des essais courts.",
    ville: "Kinshasa",
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

const normaliserFormats = (value: unknown): Array<"PDF" | "EPUB" | "Papier"> => {
  if (Array.isArray(value)) {
    const vals = value.map((v) => String(v)).filter(Boolean) as string[];
    return vals.filter((v): v is "PDF" | "EPUB" | "Papier" => ["PDF", "EPUB", "Papier"].includes(v)) as Array<"PDF" | "EPUB" | "Papier">;
  }

  const vals = String(value ?? "PDF, EPUB")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  return vals.filter((v): v is "PDF" | "EPUB" | "Papier" => ["PDF", "EPUB", "Papier"].includes(v)) as Array<"PDF" | "EPUB" | "Papier">;
};

const publicationParDefaut = () => new Date().toISOString().slice(0, 10);

const articleDepuisAdmin = (row: Record<string, unknown>, index: number): Article => ({
  slug: String(row["slug"] ?? row["id"] ?? `article-admin-${index}`),
  titre: String(row["titre"] ?? `Article ${index + 1}`),
  chapo: String(row["chapo"] ?? row["resume"] ?? ""),
  categorie: String(row["categorie"] ?? "Actualités"),
  tags: normaliserTags(row["tags"]),
  auteur: String(row["auteur"] ?? "espoir-kakesa"),
  date: String(row["date"] ?? row["datePublication"] ?? publicationParDefaut()),
  lecture: String(row["lecture"] ?? "5 min"),
  image: String(
    row["image"] ?? row["couverture"] ??
      "linear-gradient(135deg, oklch(0.62 0.15 48), oklch(0.38 0.06 40))",
  ),
  populaire: Boolean(row["populaire"] ?? row["aLaUne"] ?? false),
  corps: Array.isArray(row["corps"])
    ? row["corps"].map((part) => String(part))
    : [String(row["contenu"] ?? row["chapo"] ?? "")],
});

const livreDepuisAdmin = (row: Record<string, unknown>, index: number): Livre => {
  const sousTitre = typeof row["sousTitre"] === "string" ? String(row["sousTitre"]) : undefined;
  const promo = Number(row["promo"] ?? 0) > 0 ? Number(row["promo"]) : undefined;
  const chapitres = Array.isArray(row["chapitres"]) ? row["chapitres"] as Record<string, unknown>[] : [];

  return {
    slug: String(row["slug"] ?? row["id"] ?? `livre-admin-${index}`),
    titre: String(row["titre"] ?? `Livre ${index + 1}`),
    ...(sousTitre ? { sousTitre } : {}),
    auteur: String(row["auteur"] ?? "espoir-kakesa"),
    isbn: String(row["isbn"] ?? ""),
    resume: String(row["resume"] ?? row["description"] ?? ""),
    pages: Number(row["pages"] ?? 200),
    langue: String(row["langue"] ?? "Français"),
    categorie: String(row["categorie"] ?? "Roman"),
    publication: String(row["publication"] ?? row["date"] ?? publicationParDefaut()),
    formats: normaliserFormats(row["formats"]),
    prix: Number(row["prix"] ?? 12),
    ...(typeof promo === "number" ? { promo } : {}),
    stock: Number(row["stock"] ?? 0),
    disponible: Boolean(row["disponible"] ?? true),
    aLaUne: Boolean(row["aLaUne"] ?? false),
    couleur: String(
      row["couleur"] ?? "linear-gradient(160deg, oklch(0.62 0.15 48), oklch(0.3 0.05 40))",
    ),
    ...(typeof row["couverture"] === "string" ? { couverture: row["couverture"] as string } : {}),
    apercuPages: Number(row["apercuPages"] ?? 10),
    apercuPourcent: Number(row["apercuPourcent"] ?? 10),
    chapitres: chapitres.map((chapitre) => ({
      titre: String(chapitre["titre"] ?? "Chapitre"),
      pages: Array.isArray(chapitre["pages"])
        ? (chapitre["pages"] as unknown[]).map((page) => Number(page)).filter((page) => Number.isFinite(page))
        : [],
      gratuit: Boolean(chapitre["gratuit"] ?? false),
    })),
  };
};

const articlesPubliesAdmin = (): Article[] => {
  const admin = lireDonneesAdmin() as { articles?: Record<string, unknown>[] };
  const items = Array.isArray(admin.articles) ? admin.articles : [];
  return items
    .filter((row: Record<string, unknown>) => row["statut"] === "Publié" || row["etat"] === "Publié")
    .map((row: Record<string, unknown>, index: number) => articleDepuisAdmin(row, index));
};

const livresDisponiblesAdmin = (): Livre[] => {
  const admin = lireDonneesAdmin() as { livres?: Record<string, unknown>[] };
  const items = Array.isArray(admin.livres) ? admin.livres : [];
  return items
    .filter((row: Record<string, unknown>) => Boolean(row["disponible"]))
    .map((row: Record<string, unknown>, index: number) => livreDepuisAdmin(row, index));
};

export let articles: Article[] = [...articlesSeed, ...articlesPubliesAdmin()].filter(
  (article, index, arr) => arr.findIndex((entry) => entry.slug === article.slug) === index,
);

export let livres: Livre[] = [...livresSeed, ...livresDisponiblesAdmin()].filter(
  (livre, index, arr) => arr.findIndex((entry) => entry.slug === livre.slug) === index,
);

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

const normaliserArticleApi = (entry: any): Article => ({
  slug: String(entry?.slug ?? entry?._id ?? "article"),
  titre: String(entry?.titre ?? "Article"),
  chapo: String(entry?.chapo ?? entry?.resume ?? entry?.contenu ?? ""),
  categorie: String(entry?.categorie?.nom ?? entry?.categorie ?? "Actualités"),
  tags: Array.isArray(entry?.tags) ? entry.tags.map((tag: unknown) => String(tag)) : [],
  auteur: String(entry?.auteur?.slug ?? entry?.auteur ?? "espoir-kakesa"),
  date: String(entry?.datePublication ?? entry?.date ?? publicationParDefaut()),
  lecture: String(entry?.lecture ?? "5 min"),
  image:
    typeof entry?.couverture === "string" && entry.couverture
      ? entry.couverture
      : "linear-gradient(135deg, oklch(0.62 0.15 48), oklch(0.38 0.06 40))",
  populaire: Boolean(entry?.populaire ?? entry?.aLaUne ?? false),
  corps: Array.isArray(entry?.corps)
    ? entry.corps.map((part: unknown) => String(part))
    : [String(entry?.contenu ?? entry?.chapo ?? "")],
});

const normaliserLivreApi = (entry: any): Livre => {
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
    ...(promoValue !== undefined ? { promo: promoValue } : {}),
    stock: Number(entry?.stock ?? 0),
    disponible: Boolean(entry?.disponible ?? true),
    aLaUne: Boolean(entry?.aLaUne ?? false),
    couleur: String(entry?.couleur ?? "linear-gradient(160deg, oklch(0.62 0.15 48), oklch(0.3 0.05 40))"),
    ...(typeof entry?.couverture === "string" ? { couverture: entry.couverture } : {}),
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

const normaliserAuteurApi = (entry: any): Auteur => ({
  slug: String(entry?.slug ?? entry?._id ?? "auteur"),
  nom: String(entry?.nom ?? "Auteur"),
  role: String(entry?.role ?? "Auteur"),
  bio: String(entry?.bio ?? ""),
  ville: String(entry?.ville ?? ""),
  reseaux: Array.isArray(entry?.reseaux)
    ? entry.reseaux.map((item: any) => ({ label: String(item?.label ?? "Link"), url: String(item?.url ?? "#") }))
    : [],
  ventes: Number(entry?.ventes ?? 0),
  lectures: Number(entry?.lectures ?? 0),
  telechargements: Number(entry?.telechargements ?? 0),
});

export const hydratePublicData = async () => {
  if (typeof window === "undefined") return;

  try {
    const [articlesApi, livresApi, auteursApi] = await Promise.all([
      ArticlesApi.getAll({ page: 1, limit: 200 }),
      LivresApi.getAll({ page: 1, limit: 200 }),
      AuteursApi.getAll({ page: 1, limit: 200 }),
    ]);

    const articlesLive = normaliserValeurApi(articlesApi).map(normaliserArticleApi);
    const livresLive = normaliserValeurApi(livresApi).map(normaliserLivreApi);
    const auteursLive = normaliserValeurApi(auteursApi).map(normaliserAuteurApi);

    articles = [...articlesLive, ...articlesPubliesAdmin()].filter(
      (article, index, arr) => arr.findIndex((entry) => entry.slug === article.slug) === index,
    );
    livres = [...livresLive, ...livresDisponiblesAdmin()].filter(
      (livre, index, arr) => arr.findIndex((entry) => entry.slug === livre.slug) === index,
    );
    auteurs = auteursLive.length > 0 ? auteursLive : auteursSeed;
  } catch {
    // On garde le fallback local si l'API n'est pas encore disponible.
  }
};

if (typeof window !== "undefined") {
  void hydratePublicData();
}

export const getAuteur = (slug: string) => auteurs.find((a) => a.slug === slug);
export const nomAuteur = (slug: string) => getAuteur(slug)?.nom ?? slug;
export const getLivre = (slug: string) => livres.find((l) => l.slug === slug);
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
