import { useCallback } from "react";
import { useAdminData } from "@/lib/admin/store";
import type { Item } from "@/lib/admin/seeds";
import {
  envoyerNotificationAbonnes,
  vientDEtrePublie,
  type PayloadNotification,
} from "@/lib/newsletter/notifications";

/** Hook pour notifier les abonnés ACTIVE (mock e-mail + historique campagnes). */
export function useNotifierAbonnes() {
  const { data, creer } = useAdminData();

  const notifier = useCallback(
    (p: PayloadNotification) =>
      envoyerNotificationAbonnes(p, data.abonnes, (v) => creer("campagnes", v)),
    [data.abonnes, creer],
  );

  const notifierSiPublication = useCallback(
    (
      type: "article" | "livre",
      avant: Item | null | undefined,
      apres: Partial<Item> & { titre?: unknown; resume?: unknown; chapo?: unknown },
    ) => {
      if (!vientDEtrePublie(avant, apres, type)) return null;
      return notifier({
        type,
        titre: String(apres["titre"] ?? "Sans titre"),
        resume: String(apres["resume"] ?? apres["chapo"] ?? ""),
        sourceId: String(apres["id"] ?? avant?.id ?? ""),
      });
    },
    [notifier],
  );

  return { notifier, notifierSiPublication, abonnesActifs: data.abonnes.filter((a) => a["statut"] === "ACTIVE").length };
}
