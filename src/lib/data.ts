// Données de démonstration (front uniquement).

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

export const articles: Article[] = [
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

export const livres: Livre[] = [
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
    apercuPages: 8,
    apercuPourcent: 12,
    chapitres: chapitres(4, 64),
  },
];

export const auteurs: Auteur[] = [
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
