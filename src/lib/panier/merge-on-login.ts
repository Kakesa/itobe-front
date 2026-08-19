import { PanierApi, getToken } from "@/lib/api-client";
import { lirePanierInvite, viderPanierInvite } from "./guest-cart";

/** Fusionne le panier invité (localStorage) avec le panier serveur après connexion API. */
export async function fusionnerPanierApresConnexion(): Promise<void> {
  if (!getToken()) return;

  const items = lirePanierInvite();
  if (items.length === 0) return;

  try {
    await PanierApi.merge(items.map((i) => ({
      slug: i.slug,
      quantity: i.quantity,
      format: i.format,
    })));
    viderPanierInvite();
    window.dispatchEvent(new Event("itobe-panier"));
  } catch (err) {
    console.warn("[Panier] Fusion après connexion échouée :", err);
  }
}
