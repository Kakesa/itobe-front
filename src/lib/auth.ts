import type { Role } from "@/lib/admin-data";
import { AuthApi, clearTokens } from "./api-client";
import { fusionnerPanierApresConnexion } from "./panier/merge-on-login";

export type CompteDemo = {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: Role;
};

/** Comptes de démonstration / secours */
export const comptesDemo: CompteDemo[] = [
  {
    email: "admin@itobe.cd",
    password: "admin123",
    nom: "Kakesa",
    prenom: "Espoir",
    role: "admin",
  },
  {
    email: "editeur@itobe.cd",
    password: "editeur123",
    nom: "Bigo's",
    prenom: "Christopher",
    role: "editeur",
  },
  {
    email: "lecteur@itobe.cd",
    password: "lecteur123",
    nom: "Kabeya",
    prenom: "Nadia",
    role: "lecteur",
  },
  {
    email: "comptable@itobe.cd",
    password: "comptable123",
    nom: "Comptable",
    prenom: "Itobe",
    role: "comptable",
  },
];

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
 * Authentification synchrone (mock)
 */
export function authentifier(email: string, password: string): SessionUtilisateur | null {
  const compte = comptesDemo.find(
    (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password,
  );
  if (!compte) return null;
  return {
    email: compte.email,
    nom: compte.nom,
    prenom: compte.prenom,
    role: compte.role,
  };
}

/**
 * Authentification réelle avec l'API Backend REST
 */
export async function authentifierApi(email: string, password: string): Promise<SessionUtilisateur | null> {
  try {
    const data = await AuthApi.login({ email, password });
    const user = data?.user ?? data?.data?.user;
    if (user) {
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
    }
  } catch (error) {
    clearTokens();
    console.warn("[Auth API] Échec de connexion API, essai du fallback local :", error);
  }

  // Fallback local (sans token API — favoris/achats indisponibles)
  const sessionLocale = authentifier(email, password);
  if (sessionLocale) {
    sauvegarderSession(sessionLocale);
  }
  return sessionLocale;
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
    return JSON.parse(raw) as SessionUtilisateur;
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
