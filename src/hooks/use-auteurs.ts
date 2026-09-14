import { useEffect, useState } from "react";
import { auteurs, hydratePublicData, type Auteur, PUBLIC_DATA_EVENT } from "@/lib/data";

export function useAuteurs(): { auteurs: Auteur[]; loading: boolean } {
  const [list, setList] = useState<Auteur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      setList([...auteurs]);
      setLoading(false);
    };

    window.addEventListener(PUBLIC_DATA_EVENT, sync);
    void hydratePublicData().finally(sync);

    return () => window.removeEventListener(PUBLIC_DATA_EVENT, sync);
  }, []);

  return { auteurs: list, loading };
}
