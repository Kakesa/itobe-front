import { useI18n, type Locale } from "@/i18n";

const fr = {
  meta: {
    homeTitle: "Itobe Production — Des histoires sans frontières",
    homeDescription:
      "Itobe Production crée des films, séries et documentaires audacieux et essentiels, enracinés en Afrique et conçus pour le monde.",
    workTitle: "Œuvres — Itobe Production",
    aboutTitle: "À propos — Itobe Production",
    contactTitle: "Contact — Itobe Production",
  },
  nav: {
    work: "Œuvres",
    about: "À propos",
    contact: "Contact",
    primary: "Navigation principale",
    mobile: "Navigation mobile",
    footer: "Navigation du pied de page",
    home: "Accueil Itobe Production",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    language: "Choisir la langue",
    backToPortals: "Retour aux portails",
  },
  home: {
    kicker: "Production cinématographique indépendante · Kinshasa",
    title: "Des histoires",
    titleEm: "sans frontières.",
    lead: "Un cinéma audacieux et humain, enraciné en Afrique, conçu pour le monde.",
    heroAlt: "Silhouettes d'une équipe de tournage au crépuscule",
    sectionLabel: "Tout commence ici",
    sectionTitle: "Des histoires",
    sectionTitleEm: "ensemble.",
    sectionBody:
      "De la première idée à l'ultime plan, nous construisons des récits honnêtes et ambitieux avec celles et ceux qui les vivent.",
    explore: "Découvrir nos œuvres",
    crewAlt: "Une caméra de cinéma guidée sur un chariot de travelling",
  },
  work: {
    kicker: "Prochainement",
    title: "Nos productions",
    titleEm: "sont en cours.",
    body: "Nous développons actuellement de nouveaux récits. Revenez bientôt pour découvrir les films et séries qui prennent forme chez Itobe Production.",
  },
  about: {
    kicker: "Itobe Production · Est. Kinshasa",
    title: "Les histoires nous portent",
    titleEm: "plus loin.",
    intro:
      "Itobe Productions est une société de production audiovisuelle basée en République démocratique du Congo, dédiée au développement d’histoires africaines pour le cinéma, la télévision et l’ensemble des formats audiovisuels.",
    crewAlt: "Une équipe filmant au coucher du soleil",
    setAlt: "Caméra de cinéma installée sur un travelling, sur un plateau en extérieur",
    cta: "Apportez-nous l'histoire que vous ne pouvez pas taire.",
    talk: "Parlons-en",
  },
  contact: {
    kicker: "Contact · Kinshasa",
    business: "Pour les demandes liées à la production, aux partenariats et aux projets en développement :",
    studio: "Studio",
    follow: "Suivre",
    name: "Nom",
    email: "E-mail",
    company: "Société",
    subject: "Sujet",
    message: "Message",
    send: "Envoyer le message",
    thanks: "Merci. Votre message a bien été préparé.",
    note: "Ce formulaire valide votre message localement.",
  },
  footer: {
    tagline: "Des récits indépendants, faits avec intention.",
    places: "Kinshasa · Afrique · Le monde",
  },
  project: {
    allWork: "Toutes les œuvres",
    director: "Réalisation",
    producers: "Production",
    cast: "Distribution",
    filmedIn: "Tournage",
    watchTrailer: "Voir la bande-annonce",
    trailerAlt: "Aperçu de la bande-annonce",
    continue: "Continuer la lecture.",
    view: "Voir {title}",
  },
  studio: {
    address: "Kinshasa, République démocratique du Congo",
  },
  projects: {
    "where-the-earth-remembers": {
      title: "Là où la terre se souvient",
      type: "Long métrage",
      alt: "Une femme en robe ivoire traversant un paysage volcanique à l'aube",
      logline: "Un retour à la terre devient un face-à-face avec la mémoire.",
      synopsis:
        "Après quinze ans à l'étranger, Amara revient sur les hauts plateaux volcaniques où elle est née. Ce qui commence comme une dernière visite à la maison familiale devient une quête intime à travers le silence, l'héritage et les récits qu'un paysage refuse d'oublier.",
      cast: "Zawadi Mbuyi, Sarah Kazadi, Jean Kanku",
    },
    "the-river-between-us": {
      title: "Le fleuve entre nous",
      type: "Mini-série",
      alt: "Une pirogue solitaire traversant un vaste fleuve à l'heure bleue",
      logline: "Trois générations. Un fleuve. Une vérité portée par le courant.",
      synopsis:
        "En six chapitres, une famille partagée entre Kinshasa et Kisangani suit la trace d'une lettre disparue. Leur voyage sur le fleuve Congo révèle l'histoire privée qui les a formés — et le choix qui pourrait les ramener chez eux.",
      cast: "Dena Mwana, Christian Lukusa, Grâce Bijoux",
    },
    "hands-of-memory": {
      title: "Les mains de la mémoire",
      type: "Documentaire",
      alt: "Un artisan âgé tenant un objet sculpté à la main dans son atelier",
      logline: "Les gestes que l'on hérite deviennent les récits que l'on préserve.",
      synopsis:
        "Dans les ateliers, les cours et les chemins de village, des maîtres artisans transmettent un savoir qui n'a jamais été écrit. Les mains de la mémoire est le portrait silencieux de six créateurs et des archives vivantes portées par leurs gestes.",
      cast: "Avec des maîtres artisans d'Afrique centrale",
    },
    "beyond-the-horizon": {
      title: "Au-delà de l'horizon",
      type: "Court métrage",
      alt: "Deux enfants marchant dans les hautes herbes vers une ville au coucher du soleil",
      logline: "Un frère et une sœur marchent vers une ville qu'ils n'ont vue qu'en rêve.",
      synopsis:
        "À l'orée d'une ville qui change, Ayo et Nia se promettent de voir les lumières avant la nuit. Leur petite expédition devient un récit lumineux de parenté, d'imagination et des futurs que les enfants se construisent.",
      cast: "Merveille Mpoyi, Noé Mutombo",
    },
  },
};

const en: typeof fr = {
  meta: {
    homeTitle: "Itobe Production — Stories Without Borders",
    homeDescription:
      "Itobe Production creates bold, meaningful films, series and documentaries rooted in Africa and made for the world.",
    workTitle: "Work — Itobe Production",
    aboutTitle: "About — Itobe Production",
    contactTitle: "Contact — Itobe Production",
  },
  nav: {
    work: "Work",
    about: "About",
    contact: "Contact",
    primary: "Primary navigation",
    mobile: "Mobile navigation",
    footer: "Footer navigation",
    home: "Itobe Production home",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Choose language",
    backToPortals: "Back to portals",
  },
  home: {
    kicker: "Independent film production · Kinshasa",
    title: "Stories",
    titleEm: "without borders.",
    lead: "Bold, human cinema rooted in Africa and made for the world.",
    heroAlt: "Silhouettes of a film crew at dusk",
    sectionLabel: "The work begins here",
    sectionTitle: "Stories made",
    sectionTitleEm: "together.",
    sectionBody:
      "From the first idea to the final frame, we build honest, ambitious stories with the people who live them.",
    explore: "Explore our work",
    crewAlt: "A cinema camera guided on a dolly",
  },
  work: {
    kicker: "Coming soon",
    title: "Our productions",
    titleEm: "are in progress.",
    body: "We are currently developing new stories. Come back soon to discover the films and series taking shape at Itobe Production.",
  },
  about: {
    kicker: "Itobe Production · Est. Kinshasa",
    title: "Stories carry us",
    titleEm: "further.",
    intro:
      "Itobe Productions is an audiovisual production company based in the Democratic Republic of the Congo, dedicated to developing African stories for film, television, and all forms of audiovisual storytelling.",
    crewAlt: "A film crew shooting at sunset",
    setAlt: "Cinema camera set on a slider on an outdoor film set",
    cta: "Bring us the story you cannot leave untold.",
    talk: "Talk to us",
  },
  contact: {
    kicker: "Contact · Kinshasa",
    business: "For inquiries related to production, partnerships, and projects in development:",
    studio: "Studio",
    follow: "Follow",
    name: "Name",
    email: "Email",
    company: "Company",
    subject: "Subject",
    message: "Message",
    send: "Send message",
    thanks: "Thank you. Your message has been prepared.",
    note: "This form validates your message locally.",
  },
  footer: {
    tagline: "Independent stories, made with purpose.",
    places: "Kinshasa · Africa · The world",
  },
  project: {
    allWork: "All work",
    director: "Director",
    producers: "Producers",
    cast: "Cast",
    filmedIn: "Filmed in",
    watchTrailer: "Watch trailer",
    trailerAlt: "Trailer preview",
    continue: "Continue watching.",
    view: "View {title}",
  },
  studio: {
    address: "Kinshasa, Democratic Republic of the Congo",
  },
  projects: {
    "where-the-earth-remembers": {
      title: "Where the Earth Remembers",
      type: "Feature Film",
      alt: "A woman in an ivory dress crossing a volcanic landscape at dawn",
      logline: "A return to the land becomes a reckoning with memory.",
      synopsis:
        "After fifteen years abroad, Amara returns to the volcanic highlands where she was born. What begins as a final visit to her family home becomes an intimate search through silence, inheritance and the stories a landscape refuses to forget.",
      cast: "Zawadi Mbuyi, Sarah Kazadi, Jean Kanku",
    },
    "the-river-between-us": {
      title: "The River Between Us",
      type: "Limited Series",
      alt: "A lone canoe crossing a vast river at blue hour",
      logline: "Three generations. One river. A truth carried downstream.",
      synopsis:
        "Across six chapters, a family divided between Kinshasa and Kisangani follows the path of a missing letter. Their journey along the Congo River reveals the private history that shaped them—and the choice that could bring them home.",
      cast: "Dena Mwana, Christian Lukusa, Grâce Bijoux",
    },
    "hands-of-memory": {
      title: "Hands of Memory",
      type: "Documentary",
      alt: "An elderly artisan holding a hand-carved object in his workshop",
      logline: "The gestures we inherit become the stories we preserve.",
      synopsis:
        "In workshops, courtyards and village paths, master artisans pass on knowledge that has never been written down. Hands of Memory is a quiet portrait of six makers and the living archives carried in their gestures.",
      cast: "Featuring master artisans across Central Africa",
    },
    "beyond-the-horizon": {
      title: "Beyond the Horizon",
      type: "Short Film",
      alt: "Two children walking through tall grass toward a city at sunset",
      logline: "Two siblings walk toward a city they have only seen in dreams.",
      synopsis:
        "At the edge of a changing city, Ayo and Nia make a promise to see the lights before nightfall. Their small expedition becomes a luminous story of kinship, imagination and the futures children build for themselves.",
      cast: "Merveille Mpoyi, Noé Mutombo",
    },
  },
};

export type ProductionCopy = typeof fr;
export type ProjectSlug = keyof ProductionCopy["projects"];
export const productionCopy: Record<Locale, ProductionCopy> = { fr, en };

export function useProductionCopy() {
  const { locale } = useI18n();
  return productionCopy[locale];
}
