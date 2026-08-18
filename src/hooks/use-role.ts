import { useEffect, useState } from "react";
import type { Role } from "@/lib/admin-data";

const CLE = "itobe.role";
const ROLES_VALIDES: Role[] = ["admin", "editeur", "lecteur"];

function normaliser(v: string | null): Role {
  if (v && ROLES_VALIDES.includes(v as Role)) return v as Role;
  return "admin";
}

export function useRole() {
  const [role, setRole] = useState<Role>(() => {
    if (typeof window === "undefined") return "lecteur";
    return normaliser(localStorage.getItem(CLE));
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setRole(normaliser(localStorage.getItem(CLE)));
    const onChange = () => setRole(normaliser(localStorage.getItem(CLE)));
    window.addEventListener("itobe-role", onChange);
    return () => window.removeEventListener("itobe-role", onChange);
  }, []);

  const changerRole = (r: Role) => {
    localStorage.setItem(CLE, r);
    setRole(r);
    window.dispatchEvent(new Event("itobe-role"));
  };

  return { role, changerRole };
}
