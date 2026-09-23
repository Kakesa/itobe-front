import type { Dictionary } from "../types";

const en: Dictionary = {
  common: {
    language: "Language",
    langFr: "FR",
    langEn: "EN",
    menu: "Menu",
  },
  nav: {
    edition: {
      catalogue: "Catalogue",
      auteurs: "Authors",
      bibliotheque: "Library",
      aPropos: "About",
      contact: "Contact",
      tagline: "Publishing house",
    },
    media: {
      accueil: "Home",
      articles: "Articles",
      videos: "Videos",
      aPropos: "About",
      contact: "Contact",
      tagline: "Media",
    },
    auth: {
      connexion: "Sign in",
      inscription: "Sign up",
      deconnexion: "Sign out",
      monEspace: "My space",
      espaceAdmin: "Admin space",
      espaceEditeur: "Editor space",
    },
    switchToEdition: "Publishing house",
    switchToMedia: "Media portal",
  },
  footer: {
    blurb:
      "The voice of contemporary Africa. A space for ideas, literary creation, and the sharing of pan-African knowledge with the world.",
    backToPortals: "Back to portals",
    headingMedia: "Media",
    headingEdition: "Publishing",
    newsletterTitle: "Newsletter",
    newsletterText: "Subscribe to receive our weekly publications and book launches.",
    emailPlaceholder: "your.email@domain.com",
    emailAria: "Email address",
    subscribe: "Subscribe",
    subscribeSuccess: "You're subscribed. Thank you!",
    subscribeError: "Unable to subscribe right now.",
    copyright: "© 2026 ITOBE Entreprise. All rights reserved. Designed with pride and care.",
    popupDismiss: "Maybe later",
  },
  editionAbout: {
    metaTitle: "Our house — Itobe Éditions",
    metaDescription:
      "Read Africa. Change the world. Discover the mission and vision of Itobe Éditions: elevating African literary talent.",
    ogDescription:
      "Making Africa the heart of global storytelling — the mission and vision of Itobe Éditions.",
    heroKicker: "Our house",
    heroLine1: "Read Africa.",
    heroLine2: "Change the world.",
    missionTitle: "Our mission",
    missionText:
      "Elevate African literary talent and propel their stories so they become a source of inspiration for the entire world.",
    missionQuote: "Making Africa the heart of global storytelling.",
    missionCaption: "Every African voice deserves to be read and shared.",
    visionTitle: "Our vision",
    visionIntro:
      "We believe every African story can shape the collective imagination, reveal new perspectives, and spark a universal dialogue.",
    pillars: {
      literature: {
        alt: "Itobe illustration — Just as",
        title: "African literature beyond learning",
        text: "The goal is to show the world that Africa is not only a continent of stories to contemplate, but also an endless reservoir of stories to savor — stories that can rival those of any other culture.",
      },
      dialogue: {
        alt: "Itobe illustration — Instead of",
        title: "Universal dialogue through local stories",
        text: "Each story becomes a starting point for intercultural dialogue, reminding us that despite our geographic or social differences, we share common emotions, fears, and aspirations.",
      },
      imaginaire: {
        alt: "Itobe illustration — In short",
        title: "Shaping the collective imagination and changing perspectives",
        text: "African literature can reverse this trend by offering new images, new heroes, and new perspectives.",
      },
    },
    chezTitle: "At Itobe Éditions",
    chezText:
      "We are convinced that African literature is the next great global literary movement. Every African story has the right to be told and to shine on the international stage — not only as a legacy of our past, but as a powerful catalyst for our future.",
    ctaCatalogue: "Browse the catalogue",
    ctaAuteurs: "Our authors",
    ctaContact: "Contact us",
    featureImageAlt: "Itobe Éditions visual — Beyond the Pages",
    missionImageAlt: "Itobe Éditions illustration",
  },
  contact: {
    metaTitle: "Contact — Itobe Entreprise",
    metaDescription:
      "Contact the newsroom or Itobe's publishing desk: article pitch, manuscript, partnership, or reader support.",
    ogDescription: "Newsroom, publishing, partnerships, and support.",
    kicker: "Contact",
    title: "Let's talk about your project.",
    intro:
      "For any commercial inquiry, partnership, press, interview, podcast, event, speaking request, or other request about Neno, contact us at the following address:",
    namePlaceholder: "Full name",
    emailPlaceholder: "Email address",
    sujets: {
      redaction: "Newsroom",
      manuscrit: "Submit a manuscript",
      partenariat: "Partnership",
      support: "Reader support",
    },
    messagePlaceholder: "Your message…",
    submit: "Send message",
    success: "Thank you, your message has been received.",
    socials: "Social media",
    hoursTitle: "Hours",
    hours: "Monday – Friday, 8am – 5pm",
    mediaTitle: "Contact us",
    mediaNotice:
      "For any commercial inquiry, partnership, press, interview, podcast, event, speaking request, or other request about Neno, please use the form below.",
    mediaName: "Name",
    mediaEmail: "Email",
    mediaMessage: "Message",
    mediaSend: "Send",
    mediaError: "Sending failed. Please try again in a moment.",
  },
  mediaAbout: {
    metaTitle: "About — Neno",
    metaDescription:
      "Neno is a journey through the remarkable stories of Africa, the people who have shaped its culture, and the creations that continue to influence how the continent sees itself and how the world sees it.",
    ogDescription:
      "We explore Africa through its history, literature, cinema, innovations, music, and art.",
    heroTitle: "About",
    heroLead:
      "We explore Africa through its history, literature, cinema, innovations, revolutions, music, art, and the people who bring them to life.",
    ctaBlog: "Read the blog",
    eyebrow: "About",
    heading: "Neno",
    p1: "Neno is a journey through the remarkable stories of Africa, the people who have shaped its culture, and the creations that continue to influence how the continent sees itself and how the world sees it.",
    p2: "We explore Africa through its history, literature, cinema, innovations, revolutions, music, art, and the people who bring them to life.",
    p3: "Through conversations, reportage, testimonies, and discoveries, we want to make African culture more accessible, better understood, and, above all, more compelling to explore.",
    quote:
      "Make African culture more accessible, better understood, and more compelling to explore.",
    bleedAlt: "Neno editorial universe",
    bleedCap: "Stories that widen the gaze — at the pace of the news and the conversation.",
    formatsEyebrow: "What we publish",
    formatsTitle: "Three formats, one standard",
    formats: {
      analyses: {
        titre: "Analysis & columns",
        texte:
          "In-depth pieces and decoding of culture, the economy, and society — to understand without oversimplifying.",
      },
      entretiens: {
        titre: "Interviews & voices",
        texte:
          "Authors, artists, entrepreneurs, and thinkers: space for those who move Africa and its diaspora.",
      },
      debats: {
        titre: "Debates & readings",
        texte:
          "Crossing ideas, criticism, and conversations that feed African and international public debate.",
      },
    },
    closeEyebrow: "At Neno",
    closeTitle: "African culture, to explore",
    closeText:
      "Conversations, reportage, testimonies, and discoveries — to make Africa more accessible, better understood, and more compelling.",
    ctaArticles: "Explore the articles",
    ctaWrite: "Write to us",
    ctaEdition: "Publishing house",
  },
  editionHome: {
    metaTitle: "Publishing house — Itobe",
    metaDescription:
      "Novels, essays, poetry, and children's books. Explore the Itobe catalogue in PDF and print, with a free preview before purchase.",
    ogDescription: "Novels, essays, poetry, and children's books in PDF and print.",
    title: "A world of reading, publishing, and discovery",
    lead: "Making Africa the heart of global storytelling — novels, essays, and children's books.",
    cta: "Explore the catalogue",
    heroBadge: "New release",
    heroLearnMore: "Learn more",
    pagesLabel: "pages",
    publishedLabel: "Published",
    prevBook: "Previous book",
    nextBook: "Next book",
    tabCatalogue: "Catalogue",
    tabNouveautes: "New releases",
    tabParaitre: "Coming soon",
    catalogueLead: "Each book includes a free preview before purchase.",
    nouveautesLead: "The house’s most recent publications.",
    paraitreLead: "Announced titles, coming soon in print and digital.",
    emptyFilters:
      "No books match these filters. Try choosing “All” categories or “All” formats.",
    emptyCatalogue: "No books available at the moment.",
    emptyNouveautes: "No new releases to show at the moment.",
    emptyParaitre: "No forthcoming titles at the moment.",
    promotions: "Promotions",
    promotionsUpto: "Up to −{n}% this month",
    filterCategory: "Category",
    filterFormat: "Format",
    filterSort: "Sort by",
    sortRecent: "Newest",
    sortPrice: "Price: low to high",
    sortTitle: "Title A–Z",
  },
};

export default en;
