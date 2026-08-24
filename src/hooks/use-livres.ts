import { useEffect, useState } from "react";
import { hydratePublicData, livres, type Livre, PUBLIC_DATA_EVENT } from "@/lib/data";

export function useLivres(): { livres: Livre[]; loading: boolean } {
  const [list, setList] = useState<Livre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      setList([...livres]);
      setLoading(false);
    };

    window.addEventListener(PUBLIC_DATA_EVENT, sync);
    void hydratePublicData().finally(sync);

    return () => window.removeEventListener(PUBLIC_DATA_EVENT, sync);
  }, []);

  return { livres: list, loading };
}
