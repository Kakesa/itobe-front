import { useEffect, useState } from "react";
import { articles, hydratePublicData, type Article, PUBLIC_DATA_EVENT } from "@/lib/data";

export function useArticles(): { articles: Article[]; loading: boolean } {
  const [list, setList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      setList([...articles]);
      setLoading(false);
    };

    window.addEventListener(PUBLIC_DATA_EVENT, sync);
    void hydratePublicData().finally(sync);

    return () => window.removeEventListener(PUBLIC_DATA_EVENT, sync);
  }, []);

  return { articles: list, loading };
}
