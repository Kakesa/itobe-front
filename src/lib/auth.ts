import type { Role } from "@/lib/admin-data";
import { AuthApi, clearTokens } from "./api-client";
import { fusionnerPanierApresConnexion } from "./panier/merge-on-login";

export type SessionUtilisateur = {
  id?: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
};

const CLE_SESSION = "itobe.session";
const CLE_ROLE = "itobe.role";

/**
 * Authentification réelle avec l'API. Aucun compte de secours n'est embarqué dans le navigateur.
 */
export async function authentifierApi(email: string, password: string): Promise<SessionUtilisateur | null> {
  try {
    const data = await AuthApi.login({ email, password });
    const user = data?.user ?? data?.data?.user;
    if (!user) return null;
    const session: SessionUtilisateur = {
      id: user._id || user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom || "",
      role: user.role as Role,
    };
    sauvegarderSession(session);
    await fusionnerPanierApresConnexion();
    return session;
  } catch {
    clearTokens();
    return null;
  }
}

export function sauvegarderSession(session: SessionUtilisateur) {
  localStorage.setItem(CLE_SESSION, JSON.stringify(session));
  localStorage.setItem(CLE_ROLE, session.role);
  window.dispatchEvent(new Event("itobe-role"));
  window.dispatchEvent(new Event("itobe-session"));
}

export function lireSession(): SessionUtilisateur | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLE_SESSION);
    if (!raw) return null;
    const session = JSON.parse(raw) as SessionUtilisateur;
    const roleSensible = session.role === "admin" || session.role === "editeur" || session.role === "comptable";
    if (roleSensible && !localStorage.getItem("itobe.token")) return null;
    return session;
  } catch {
    return null;
  }
}

export function deconnecter() {
  clearTokens();
  localStorage.removeItem(CLE_SESSION);
  localStorage.removeItem(CLE_ROLE);
  window.dispatchEvent(new Event("itobe-session"));
  window.dispatchEvent(new Event("itobe-role"));
}
