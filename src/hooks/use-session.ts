import { useEffect, useState } from "react";
import {
  deconnecter,
  lireSession,
  type SessionUtilisateur,
} from "@/lib/auth";

export function useSession() {
  const [session, setSession] = useState<SessionUtilisateur | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
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
