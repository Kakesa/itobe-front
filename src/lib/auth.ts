import type { Role } from "@/lib/admin-data";

export type CompteDemo = {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: Role;
};

/** Comptes de démonstration (front only). */
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
];

export type SessionUtilisateur = {
  email: string;
  nom: string;
  prenom: string;
  role: Role;
};

const CLE_SESSION = "itobe.session";
const CLE_ROLE = "itobe.role";

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
  localStorage.removeItem(CLE_SESSION);
  window.dispatchEvent(new Event("itobe-session"));
}
