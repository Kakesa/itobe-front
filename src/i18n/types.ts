export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_STORAGE_KEY = "itobe-locale";

export type Dictionary = {
  common: {
    language: string;
    langFr: string;
    langEn: string;
    menu: string;
  };
  nav: {
    edition: {
      catalogue: string;
      auteurs: string;
      bibliotheque: string;
      aPropos: string;
      contact: string;
      tagline: string;
    };
    media: {
      articles: string;
      videos: string;
      aPropos: string;
      contact: string;
      tagline: string;
    };
    auth: {
      connexion: string;
      inscription: string;
      deconnexion: string;
      monEspace: string;
      espaceAdmin: string;
      espaceEditeur: string;
    };
    switchToEdition: string;
    switchToMedia: string;
  };
  footer: {
    blurb: string;
    backToPortals: string;
    headingMedia: string;
    headingEdition: string;
    newsletterTitle: string;
    newsletterText: string;
    emailPlaceholder: string;
    emailAria: string;
    subscribe: string;
    subscribeSuccess: string;
    subscribeError: string;
    copyright: string;
  };
  editionAbout: {
    metaTitle: string;
    metaDescription: string;
    ogDescription: string;
    heroKicker: string;
    heroLine1: string;
    heroLine2: string;
    missionTitle: string;
    missionText: string;
    missionQuote: string;
    missionCaption: string;
    visionTitle: string;
    visionIntro: string;
    pillars: {
      literature: { alt: string; title: string; text: string };
      dialogue: { alt: string; title: string; text: string };
      imaginaire: { alt: string; title: string; text: string };
    };
    chezTitle: string;
    chezText: string;
    ctaCatalogue: string;
    ctaAuteurs: string;
    ctaContact: string;
    featureImageAlt: string;
    missionImageAlt: string;
  };
  contact: {
    metaTitle: string;
    metaDescription: string;
    ogDescription: string;
    kicker: string;
    title: string;
    intro: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    sujets: {
      redaction: string;
      manuscrit: string;
      partenariat: string;
      support: string;
    };
    messagePlaceholder: string;
    submit: string;
    success: string;
    socials: string;
    hoursTitle: string;
    hours: string;
  };
  mediaAbout: {
    metaTitle: string;
    metaDescription: string;
    ogDescription: string;
    heroTitle: string;
    heroLead: string;
    ctaBlog: string;
    eyebrow: string;
    heading: string;
    p1: string;
    p2: string;
    p3: string;
    quote: string;
    bleedAlt: string;
    bleedCap: string;
    formatsEyebrow: string;
    formatsTitle: string;
    formats: {
      analyses: { titre: string; texte: string };
      entretiens: { titre: string; texte: string };
      debats: { titre: string; texte: string };
    };
    closeEyebrow: string;
    closeTitle: string;
    closeText: string;
    ctaArticles: string;
    ctaWrite: string;
    ctaEdition: string;
  };
};
