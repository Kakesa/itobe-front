// Jeux de données newsletter (abonnés, campagnes, templates) — front mock.
import type { Item } from "@/lib/admin/seeds";
import type { Bloc } from "./newsletter";

const blocs = (...b: Bloc[]) => b;

export const seedAbonnes: Item[] = [
  { id: "sub-1", nom: "Nadia Kabeya", email: "nadia@itobe.cd", statut: "ACTIVE", inscription: "2026-07-28", interaction: "2026-08-08", source: "Site web", interet: "Média", achats: 2, premium: true },
  { id: "sub-2", nom: "Serge Ilunga", email: "serge@itobe.cd", statut: "ACTIVE", inscription: "2026-03-14", interaction: "2026-08-05", source: "Achat de livre", interet: "Édition", achats: 4, premium: false },
  { id: "sub-3", nom: "Aline Mputu", email: "aline@itobe.cd", statut: "ACTIVE", inscription: "2025-11-02", interaction: "2026-06-01", source: "Import", interet: "Média", achats: 0, premium: false },
  { id: "sub-4", nom: "Joël Tshibangu", email: "joel@itobe.cd", statut: "UNSUBSCRIBED", inscription: "2026-01-19", interaction: "2026-05-11", source: "Site web", interet: "Média", achats: 1, premium: false },
  { id: "sub-5", nom: "Grace Lumbu", email: "grace@itobe.cd", statut: "ACTIVE", inscription: "2026-08-01", interaction: "2026-08-09", source: "Premium", interet: "Édition", achats: 3, premium: true },
  { id: "sub-6", nom: "Patrick Nzuzi", email: "patrick@itobe.cd", statut: "BOUNCED", inscription: "2025-09-23", interaction: "2026-02-17", source: "Import", interet: "Média", achats: 0, premium: false },
  { id: "sub-7", nom: "Ruth Kalala", email: "ruth@itobe.cd", statut: "ACTIVE", inscription: "2026-07-30", interaction: "2026-08-07", source: "Ajout manuel", interet: "Édition", achats: 1, premium: false },
  { id: "sub-8", nom: "David Mukendi", email: "david@itobe.cd", statut: "BLOCKED", inscription: "2026-04-04", interaction: "2026-04-05", source: "Site web", interet: "Média", achats: 0, premium: false },
];

/** Templates prêts à l'emploi : sujet + usage + contenu rédigé. */
export const seedTemplates: Item[] = [
  {
    id: "tpl-actus",
    nom: "Actualités média",
    sujet: "À la une cette semaine sur Itobe",
    categorie: "Média",
    usage: "Annoncer 1 à 3 articles récents du portail Média.",
    description:
      "E-mail rédigé pour la rédaction : introduction chaleureuse, mise en avant d'un article à la une, appel à lire sur le site, réseaux et pied de page légal.",
    blocs: blocs(
      {
        id: "b1",
        type: "TEXT",
        titre: "L'actualité Itobe",
        sousTitre: "La sélection de la rédaction",
        texte:
          "Bonjour,\n\nVoici les lectures que nous avons choisies pour vous cette semaine : enquêtes, chroniques et interviews à ne pas manquer sur le portail Média.",
      },
      {
        id: "b2",
        type: "ARTICLE",
        titre: "À la une",
        sousTitre: "Notre article du moment",
        texte: "Découvrez le dossier qui fait parler cette semaine.",
        lien: "https://itobe.cd/media",
      },
      { id: "b3", type: "DIVIDER" },
      {
        id: "b4",
        type: "BUTTON",
        libelleLien: "Lire sur Itobe Média",
        lien: "https://itobe.cd/media",
      },
      {
        id: "b5",
        type: "SOCIAL_LINKS",
        texte: "Facebook · X · Instagram · LinkedIn",
      },
      {
        id: "b6",
        type: "FOOTER",
        texte:
          "Itobe Entreprise — Kinshasa, RDC. Vous recevez cet e-mail car vous êtes abonné à la newsletter Média. Se désabonner.",
      },
    ),
  },
  {
    id: "tpl-livres",
    nom: "Nouveautés livres",
    sujet: "Nouvelles parutions à découvrir chez Itobe",
    categorie: "Édition",
    usage: "Présenter une ou plusieurs nouveautés du catalogue.",
    description:
      "Template maison d'édition : accroche sur les parutions, livre mis en avant, bouton catalogue et message d'invitation à l'aperçu gratuit.",
    blocs: blocs(
      {
        id: "b1",
        type: "TEXT",
        titre: "Nos nouveautés",
        sousTitre: "Maison d'édition Itobe",
        texte:
          "Bonjour,\n\nDe nouveaux titres rejoignent le catalogue : romans, essais et jeunesse. Feuilletez un aperçu gratuit, puis choisissez le format PDF, EPUB ou papier.",
      },
      {
        id: "b2",
        type: "BOOK",
        titre: "Le livre du mois",
        sousTitre: "Coup de cœur de l'équipe",
        texte: "Une lecture à placer en tête de votre bibliothèque.",
        lien: "https://itobe.cd/edition",
      },
      {
        id: "b3",
        type: "BUTTON",
        libelleLien: "Voir le catalogue",
        lien: "https://itobe.cd/edition",
      },
      {
        id: "b4",
        type: "FOOTER",
        texte:
          "Itobe Édition — Kinshasa, RDC. Vous recevez cet e-mail car vous suivez nos parutions. Se désabonner.",
      },
    ),
  },
  {
    id: "tpl-promo",
    nom: "Promotion catalogue",
    sujet: "Offre limitée : jusqu'à -25 % sur une sélection Itobe",
    categorie: "Commercial",
    usage: "Lancer une promo, un code ou une quinzaine tarifaire.",
    description:
      "E-mail commercial prêt : titre d'offre, période de validité, bénéfice clair et bouton d'action. Idéal pour les campagnes marketing.",
    blocs: blocs(
      {
        id: "b1",
        type: "TEXT",
        titre: "Offre de la quinzaine",
        sousTitre: "Jusqu'au 15 du mois",
        texte:
          "Profitez de -25 % sur une sélection d'essais et de romans. L'offre est valable en ligne uniquement, sur les formats numériques et papier indiqués dans le catalogue.",
      },
      {
        id: "b2",
        type: "BUTTON",
        libelleLien: "J'en profite maintenant",
        lien: "https://itobe.cd/edition",
      },
      {
        id: "b3",
        type: "TEXT",
        titre: "",
        texte:
          "Astuce : connectez-vous à votre espace lecteur pour retrouver vos achats et téléchargements instantanément après paiement.",
      },
      {
        id: "b4",
        type: "FOOTER",
        texte:
          "Itobe Entreprise — Offre non cumulable. Se désabonner des e-mails commerciaux.",
      },
    ),
  },
  {
    id: "tpl-hebdo",
    nom: "Newsletter hebdomadaire",
    sujet: "Votre vendredi Itobe : 5 minutes de lecture",
    categorie: "Récurrent",
    usage: "Envoi chaque vendredi (média + édition).",
    description:
      "Format court du week-end : un article de la semaine, une lecture conseillée, ton conversationnel. Prêt à programmer chaque vendredi 18 h.",
    blocs: blocs(
      {
        id: "b1",
        type: "TEXT",
        titre: "Vendredi chez Itobe",
        sousTitre: "Le résumé de la semaine",
        texte:
          "Bonjour,\n\nEn cinq minutes : l'essentiel de la rédaction et une lecture pour le week-end. Installez-vous confortablement.",
      },
      {
        id: "b2",
        type: "ARTICLE",
        titre: "Article de la semaine",
        texte: "Le texte que toute la rédaction a commenté.",
        lien: "https://itobe.cd/media",
      },
      { id: "b3", type: "DIVIDER" },
      {
        id: "b4",
        type: "BOOK",
        titre: "Lecture conseillée",
        texte: "Pour prolonger la réflexion ce week-end.",
        lien: "https://itobe.cd/edition",
      },
      {
        id: "b5",
        type: "FOOTER",
        texte: "Itobe Entreprise — Newsletter hebdomadaire. Se désabonner.",
      },
    ),
  },
  {
    id: "tpl-mensuel",
    nom: "Newsletter mensuelle",
    sujet: "Le mois chez Itobe : dossier, parutions et communauté",
    categorie: "Récurrent",
    usage: "Bilan mensuel éditorial et communautaire.",
    description:
      "Panorama du mois : dossier média, parution phare, invitation à partager. Plus long que l'hebdo, idéal le 1er du mois.",
    blocs: blocs(
      {
        id: "b1",
        type: "TEXT",
        titre: "Le mois chez Itobe",
        sousTitre: "Édition, média et communauté",
        texte:
          "Bonjour,\n\nRetour sur les temps forts du mois : nos dossiers, nos parutions et les échanges avec la communauté des lecteurs.",
      },
      {
        id: "b2",
        type: "ARTICLE",
        titre: "Dossier du mois",
        texte: "L'enquête ou la chronique qui a marqué la période.",
        lien: "https://itobe.cd/media",
      },
      {
        id: "b3",
        type: "BOOK",
        titre: "Parution du mois",
        texte: "Le titre que nous mettons en avant ce mois-ci.",
        lien: "https://itobe.cd/edition",
      },
      {
        id: "b4",
        type: "SOCIAL_LINKS",
        texte: "Facebook · X · Instagram · LinkedIn",
      },
      {
        id: "b5",
        type: "FOOTER",
        texte: "Itobe Entreprise — Newsletter mensuelle. Se désabonner.",
      },
    ),
  },
  {
    id: "tpl-notif-article",
    nom: "Notification — nouvel article",
    sujet: "Nouvel article publié sur Itobe",
    categorie: "Notification",
    usage: "Alerte courte quand un article vient d'être publié.",
    description:
      "Message d'alerte déjà rédigé : annonce de publication, rappel de lire sur le portail Média, ton direct. Utilisé aussi automatiquement à la publication.",
    blocs: blocs(
      {
        id: "b1",
        type: "TEXT",
        titre: "Nouvel article disponible",
        sousTitre: "Itobe Média",
        texte:
          "Bonjour,\n\nUn nouvel article vient d'être publié sur Itobe. Ouvrez-le dès maintenant pour rester à jour avec la rédaction.",
      },
      {
        id: "b2",
        type: "ARTICLE",
        titre: "Lire l'article",
        texte: "Accédez au contenu complet sur le portail Média.",
        lien: "https://itobe.cd/media",
      },
      {
        id: "b3",
        type: "BUTTON",
        libelleLien: "Ouvrir l'article",
        lien: "https://itobe.cd/media",
      },
      {
        id: "b4",
        type: "FOOTER",
        texte:
          "Itobe — Notification de publication. Vous pouvez gérer vos alertes dans Paramètres. Se désabonner.",
      },
    ),
  },
  {
    id: "tpl-notif-livre",
    nom: "Notification — nouveau livre",
    sujet: "Nouveau livre disponible chez Itobe Édition",
    categorie: "Notification",
    usage: "Alerte courte quand un livre est mis en vente.",
    description:
      "Annonce de parution prête à l'envoi : titre accrocheur, invitation à découvrir le livre et aperçu gratuit, lien catalogue.",
    blocs: blocs(
      {
        id: "b1",
        type: "TEXT",
        titre: "Une nouvelle parution",
        sousTitre: "Maison d'édition Itobe",
        texte:
          "Bonjour,\n\nUn nouveau livre est disponible dans le catalogue Itobe. Découvrez la couverture, lisez un aperçu gratuit, puis achetez au format qui vous convient.",
      },
      {
        id: "b2",
        type: "BOOK",
        titre: "Découvrir le livre",
        texte: "Disponible en PDF, EPUB et papier selon les titres.",
        lien: "https://itobe.cd/edition",
      },
      {
        id: "b3",
        type: "BUTTON",
        libelleLien: "Voir le livre",
        lien: "https://itobe.cd/edition",
      },
      {
        id: "b4",
        type: "FOOTER",
        texte:
          "Itobe Édition — Notification de parution. Se désabonner.",
      },
    ),
  },
  {
    id: "tpl-notif-annonce",
    nom: "Notification — annonce générale",
    sujet: "Une information importante de la part d'Itobe",
    categorie: "Notification",
    usage: "Communiquer une info plateforme (maintenance, événement, nouveauté).",
    description:
      "Template neutre déjà écrit pour une annonce institutionnelle : message clair, bouton vers le site, sans contenu commercial agressif.",
    blocs: blocs(
      {
        id: "b1",
        type: "TEXT",
        titre: "Information Itobe",
        sousTitre: "À l'attention de nos abonnés",
        texte:
          "Bonjour,\n\nNous souhaitons vous informer d'une actualité concernant la plateforme Itobe. Merci de prendre connaissance des détails ci-dessous et de vous rendre sur le site pour en savoir plus.",
      },
      {
        id: "b2",
        type: "BUTTON",
        libelleLien: "En savoir plus sur Itobe",
        lien: "https://itobe.cd",
      },
      {
        id: "b3",
        type: "FOOTER",
        texte:
          "Itobe Entreprise — Communication abonnés. Se désabonner.",
      },
    ),
  },
  {
    id: "tpl-bienvenue",
    nom: "Bienvenue nouvel abonné",
    sujet: "Bienvenue chez Itobe — votre espace lecture commence ici",
    categorie: "Onboarding",
    usage: "Premier e-mail après inscription newsletter.",
    description:
      "Message de bienvenue complet : présentation des deux portails, invitation à explorer le catalogue et les actualités, ton accueillant.",
    blocs: blocs(
      {
        id: "b1",
        type: "TEXT",
        titre: "Bienvenue chez Itobe",
        sousTitre: "Média & maison d'édition",
        texte:
          "Bonjour et merci de nous rejoindre.\n\nItobe réunit un média en ligne et une maison d'édition numérique. Retrouvez des articles, découvrez des livres, et synchronisez votre bibliothèque sur tous vos appareils.",
      },
      {
        id: "b2",
        type: "BUTTON",
        libelleLien: "Découvrir le portail Média",
        lien: "https://itobe.cd/media",
      },
      {
        id: "b3",
        type: "BUTTON",
        libelleLien: "Parcourir le catalogue",
        lien: "https://itobe.cd/edition",
      },
      {
        id: "b4",
        type: "FOOTER",
        texte:
          "Itobe Entreprise — Bienvenue dans la communauté. Se désabonner.",
      },
    ),
  },
];

export const seedCampagnes: Item[] = [
  {
    id: "cmp-1",
    nom: "Hebdo — semaine 32",
    sujet: "Votre vendredi Itobe : 5 minutes de lecture",
    type: "marketing",
    expediteur: "La rédaction Itobe",
    emailExpediteur: "hello@itobe.cd",
    repondreA: "contact@itobe.cd",
    audience: "tous",
    template: "tpl-hebdo",
    statut: "SENT",
    creee: "2026-08-03T09:00",
    envoiPrevu: "2026-08-07T18:00",
    envoyee: "2026-08-07T18:02",
    destinataires: 1250,
    envoyes: 1250,
    delivres: 1220,
    ouvertures: 640,
    clics: 180,
    desabonnements: 12,
    blocs: seedTemplates.find((t) => t.id === "tpl-hebdo")?.["blocs"] ?? [],
  },
  {
    id: "cmp-2",
    nom: "Nouveautés — rentrée littéraire",
    sujet: "Nouvelles parutions à découvrir chez Itobe",
    type: "marketing",
    expediteur: "Itobe Édition",
    emailExpediteur: "edition@itobe.cd",
    repondreA: "edition@itobe.cd",
    audience: "acheteurs",
    template: "tpl-livres",
    statut: "SCHEDULED",
    creee: "2026-08-08T11:30",
    envoiPrevu: "2026-08-25T18:00",
    envoyee: "",
    destinataires: 412,
    envoyes: 0,
    delivres: 0,
    ouvertures: 0,
    clics: 0,
    desabonnements: 0,
    blocs: seedTemplates.find((t) => t.id === "tpl-livres")?.["blocs"] ?? [],
  },
  {
    id: "cmp-3",
    nom: "Promo quinzaine de l'essai",
    sujet: "Offre limitée : jusqu'à -25 % sur une sélection Itobe",
    type: "marketing",
    expediteur: "Itobe",
    emailExpediteur: "hello@itobe.cd",
    repondreA: "contact@itobe.cd",
    audience: "premium",
    template: "tpl-promo",
    statut: "DRAFT",
    creee: "2026-08-09T15:10",
    envoiPrevu: "",
    envoyee: "",
    destinataires: 0,
    envoyes: 0,
    delivres: 0,
    ouvertures: 0,
    clics: 0,
    desabonnements: 0,
    blocs: seedTemplates.find((t) => t.id === "tpl-promo")?.["blocs"] ?? [],
  },
  {
    id: "cmp-4",
    nom: "Mensuelle — juillet",
    sujet: "Le mois chez Itobe : dossier, parutions et communauté",
    type: "marketing",
    expediteur: "La rédaction Itobe",
    emailExpediteur: "hello@itobe.cd",
    repondreA: "contact@itobe.cd",
    audience: "media",
    template: "tpl-mensuel",
    statut: "SENT",
    creee: "2026-06-28T10:00",
    envoiPrevu: "2026-07-01T09:00",
    envoyee: "2026-07-01T09:03",
    destinataires: 1180,
    envoyes: 1180,
    delivres: 1131,
    ouvertures: 502,
    clics: 121,
    desabonnements: 9,
    blocs: seedTemplates.find((t) => t.id === "tpl-mensuel")?.["blocs"] ?? [],
  },
  {
    id: "cmp-5",
    nom: "Relance panier — juin",
    sujet: "Offre limitée : jusqu'à -25 % sur une sélection Itobe",
    type: "marketing",
    expediteur: "Itobe Édition",
    emailExpediteur: "edition@itobe.cd",
    repondreA: "edition@itobe.cd",
    audience: "acheteurs",
    template: "tpl-promo",
    statut: "FAILED",
    creee: "2026-06-11T08:00",
    envoiPrevu: "2026-06-12T08:00",
    envoyee: "",
    destinataires: 260,
    envoyes: 88,
    delivres: 61,
    ouvertures: 18,
    clics: 3,
    desabonnements: 1,
    blocs: seedTemplates.find((t) => t.id === "tpl-promo")?.["blocs"] ?? [],
  },
];
