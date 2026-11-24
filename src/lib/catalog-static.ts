/**
 * Données statiques du catalogue, lues seulement par les seeds admin.
 * Aucun import : ce module doit s'initialiser sans passer par data.ts,
 * sinon le bundle SSR lit articles avant son initialisation.
 * Le même jeu d'articles est recopié dans src/lib/data.ts.
 */
export type ArticleStatique = {
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

export const articlesSeed: ArticleStatique[] = [
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
