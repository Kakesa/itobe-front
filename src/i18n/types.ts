export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_STORAGE_KEY = "itobe-locale";

export type Dictionary = {
  common: {
    language: string;
    langFr: string;
    langEn: string;
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
    };
    switchToEdition: string;
    switchToMedia: string;
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
};
