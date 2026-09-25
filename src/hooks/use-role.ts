import { useEffect, useState } from "react";
import type { Role } from "@/lib/admin-data";

const CLE = "itobe.role";
const CLE_SESSION = "itobe.session";
const ROLES_VALIDES: Role[] = ["admin", "editeur", "lecteur", "comptable"];

function normaliser(v: string | null): Role {
  const valeur = v?.trim().toLowerCase();
  if (valeur === "administrateur" || valeur === "administrator") return "admin";
  if (valeur && ROLES_VALIDES.includes(valeur as Role)) return valeur as Role;
  return "lecteur";
}

function lireRoleDepuisStorage(): Role {
  if (typeof window === "undefined") return "lecteur";

  try {
    const raw = localStorage.getItem(CLE_SESSION);
    if (raw) {
      const session = JSON.parse(raw) as { role?: string };
      if (session.role && ROLES_VALIDES.includes(session.role as Role)) {
        return session.role as Role;
      }
    }
  } catch {
    /* ignore */
  }

  return normaliser(localStorage.getItem(CLE));
}

export function useRole() {
  const [role, setRole] = useState<Role>("lecteur");
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setRole(lireRoleDepuisStorage());
    setPret(true);
    const onChange = () => setRole(lireRoleDepuisStorage());
    window.addEventListener("itobe-role", onChange);
    window.addEventListener("itobe-session", onChange);
    return () => {
      window.removeEventListener("itobe-role", onChange);
      window.removeEventListener("itobe-session", onChange);
    };
  }, []);

  const changerRole = (r: Role) => {
    localStorage.setItem(CLE, r);
    setRole(r);
    window.dispatchEvent(new Event("itobe-role"));
  };

  return { role, pret, changerRole };
}
