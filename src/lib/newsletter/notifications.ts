// Notifications e-mail mock → campagnes auto envoyées aux abonnés ACTIVE.
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";
import { blocsDe, type Bloc } from "./newsletter";
import { seedTemplates } from "./seeds";

export type TypeNotification = "article" | "livre" | "manuelle";

export type PayloadNotification = {
  type: TypeNotification;
  titre: string;
  resume?: string;
  sourceId?: string;
  /** Contenu déjà rédigé (depuis un template). */
  sujet?: string;
  blocs?: Bloc[];
  templateId?: string;
};

function maintenant() {
  return new Date().toISOString().slice(0, 16);
}

function abonnesActifs(abonnes: Item[]) {
  return abonnes.filter((a) => a["statut"] === "ACTIVE");
}

function templateParDefaut(type: TypeNotification): Item | undefined {
  const id =
    type === "livre"
      ? "tpl-notif-livre"
      : type === "article"
        ? "tpl-notif-article"
        : "tpl-notif-annonce";
  return seedTemplates.find((t) => t.id === id);
}

/** Personnalise un template avec le titre publié. */
function personnaliserBlocs(blocs: Bloc[], titre: string, resume?: string): Bloc[] {
  return blocs.map((b, i) => {
    if (i === 0 && b.type === "TEXT") {
      return {
        ...b,
        texte: resume?.trim()
          ? `${b.texte ?? ""}\n\n« ${titre} » — ${resume.trim()}`
          : `${b.texte ?? ""}\n\nTitre : « ${titre} ».`,
      };
    }
    if ((b.type === "ARTICLE" || b.type === "BOOK") && titre) {
      return { ...b, titre };
    }
    return b;
  });
}

function blocsDepuisTemplate(p: PayloadNotification): Bloc[] {
  if (p.blocs && p.blocs.length > 0) {
    return personnaliserBlocs(p.blocs, p.titre, p.resume);
  }
  const tpl = templateParDefaut(p.type);
  if (tpl) {
    return personnaliserBlocs(blocsDe(tpl["blocs"]), p.titre, p.resume);
  }
  return [
    {
      id: "fallback",
      type: "TEXT",
      titre: p.titre,
      texte: p.resume ?? "Nouvelle publication sur Itobe.",
    },
  ];
}

/** Construit l'item campagne déjà marquée SENT. */
export function construireCampagneEnvoyee(
  p: PayloadNotification,
  destinataires: number,
): Omit<Item, "id"> {
  const t = maintenant();
  const delivres = Math.round(destinataires * 0.97);
  const tpl = p.templateId
    ? seedTemplates.find((x) => x.id === p.templateId)
    : templateParDefaut(p.type);
  const sujet =
    p.sujet?.trim() ||
    String(tpl?.["sujet"] ?? "") ||
    (p.type === "livre"
      ? `Nouveau livre : ${p.titre}`
      : p.type === "article"
        ? `Nouvel article : ${p.titre}`
        : p.titre);
  const nom =
    p.type === "manuelle"
      ? `Notification — ${String(tpl?.["nom"] ?? p.titre)}`
      : p.type === "livre"
        ? `Notification livre — ${p.titre}`
        : `Notification article — ${p.titre}`;

  return {
    nom,
    sujet,
    type: "notification",
    source: p.type,
    sourceId: p.sourceId ?? "",
    expediteur: "Itobe",
    emailExpediteur: "hello@itobe.cd",
    repondreA: "contact@itobe.cd",
    audience: "tous",
    template: p.templateId || String(tpl?.id ?? ""),
    statut: "SENT",
    creee: t,
    envoiPrevu: t,
    envoyee: t,
    destinataires,
    envoyes: destinataires,
    delivres,
    ouvertures: Math.round(delivres * 0.42),
    clics: Math.round(delivres * 0.11),
    desabonnements: Math.max(0, Math.round(delivres * 0.004)),
    blocs: blocsDepuisTemplate(p),
    journal: [
      { date: t, action: "Campagne créée depuis un template" },
      {
        date: t,
        action: `E-mail envoyé à ${destinataires} abonné(s) actif(s)`,
      },
    ],
  };
}

/**
 * Envoie (mock) une notification e-mail à tous les abonnés ACTIVE
 * et enregistre une campagne « notification » dans l'historique.
 */
export function envoyerNotificationAbonnes(
  p: PayloadNotification,
  abonnes: Item[],
  creerCampagne: (v: Omit<Item, "id"> & { id?: string }) => Item,
): { count: number; campagne: Item } | null {
  const actifs = abonnesActifs(abonnes);
  if (actifs.length === 0) {
    notify.attention("Aucun abonné actif", {
      description: "Ajoutez des abonnés ACTIVE avant d'envoyer une notification.",
    });
    return null;
  }

  const campagne = creerCampagne(construireCampagneEnvoyee(p, actifs.length));
  notify.succes("Notification e-mail envoyée", {
    description: `${actifs.length} abonné(s) notifié(s) — « ${campagne["sujet"]} »`,
  });
  return { count: actifs.length, campagne };
}

/** True si on passe d'un état non publié → publié (évite les doubles envois). */
export function vientDEtrePublie(
  avant: Item | null | undefined,
  apres: Partial<Item>,
  type: "article" | "livre",
) {
  if (type === "article") {
    const publie = apres["statut"] === "Publié" || apres["etat"] === "Publié";
    const etait = avant && (avant["statut"] === "Publié" || avant["etat"] === "Publié");
    return Boolean(publie && !etait);
  }
  const publie = apres["disponible"] === true;
  const etait = avant && avant["disponible"] === true;
  return Boolean(publie && !etait);
}
