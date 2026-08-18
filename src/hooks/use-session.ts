import { useEffect, useState } from "react";
import {
  deconnecter,
  lireSession,
  type SessionUtilisateur,
} from "@/lib/auth";

export function useSession() {
  const [session, setSession] = useState<SessionUtilisateur | null>(() => {
    if (typeof window === "undefined") return null;
    return lireSession();
  });
  const [pret, setPret] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSession(lireSession());
    setPret(true);
    const sync = () => setSession(lireSession());
    window.addEventListener("itobe-session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("itobe-session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    session,
    pret,
    connecte: Boolean(session),
    deconnexion: () => {
      deconnecter();
      setSession(null);
    },
  };
}
