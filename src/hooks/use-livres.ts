import { useEffect, useState } from "react";
import { hydratePublicData, livres, type Livre, PUBLIC_DATA_EVENT } from "@/lib/data";

export function useLivres(): { livres: Livre[]; loading: boolean } {
  const [list, setList] = useState<Livre[]>(() => [...livres]);
  const [loading, setLoading] = useState(() => livres.length === 0);

  useEffect(() => {
    const sync = () => {
      setList([...livres]);
      setLoading(false);
    };
    sync();
    window.addEventListener(PUBLIC_DATA_EVENT, sync);
    if (livres.length === 0) {
      void hydratePublicData().finally(() => setLoading(false));
    }
    return () => window.removeEventListener(PUBLIC_DATA_EVENT, sync);
  }, []);

  return { livres: list, loading };
}
