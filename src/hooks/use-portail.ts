import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  ecrirePortail,
  lirePortail,
  portailDepuisChemin,
  type Portail,
} from "@/lib/portal";

export function usePortailActif(): Portail {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const depuisUrl = portailDepuisChemin(pathname);
  const [memorise, setMemorise] = useState<Portail | null>(null);

  useEffect(() => {
    if (depuisUrl) {
      ecrirePortail(depuisUrl);
      setMemorise(depuisUrl);
      return;
    }
    setMemorise(lirePortail());
  }, [pathname, depuisUrl]);

  return depuisUrl ?? memorise ?? "media";
}
