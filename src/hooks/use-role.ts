import { useEffect, useState } from "react";
import type { Role } from "@/lib/admin-data";

const CLE = "itobe.role";

export function useRole() {
  const [role, setRole] = useState<Role>("admin");

  useEffect(() => {
    const enregistre = localStorage.getItem(CLE) as Role | null;
    if (enregistre) setRole(enregistre);
    const onChange = () => {
      const r = localStorage.getItem(CLE) as Role | null;
      if (r) setRole(r);
    };
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
