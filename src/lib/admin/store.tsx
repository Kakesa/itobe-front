// Store CRUD centralisé du back-office (persisté en localStorage, front only).
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Item } from "./seeds";
import {
  seedActualites,
  seedArticles,
  seedAuteurs,
  seedCategoriesLivres,
  seedCategoriesMedia,
  seedCommandes,
  seedCommentaires,
  seedCoupons,
  seedLivres,
  seedMedias,
  seedNewsletter,
  seedPaiements,
  seedPromotions,
  seedUtilisateurs,
} from "./seeds";
import { seedAbonnes, seedCampagnes, seedTemplates } from "@/lib/newsletter/seeds";

const CLE = "itobe.admin.data.v5";

const SEEDS = {
  articles: seedArticles,
  actualites: seedActualites,
  livres: seedLivres,
  auteurs: seedAuteurs,
  categoriesMedia: seedCategoriesMedia,
  categoriesLivres: seedCategoriesLivres,
  medias: seedMedias,
  commandes: seedCommandes,
  paiements: seedPaiements,
  coupons: seedCoupons,
  promotions: seedPromotions,
  utilisateurs: seedUtilisateurs,
  commentaires: seedCommentaires,
  newsletter: seedNewsletter,
  abonnes: seedAbonnes,
  campagnes: seedCampagnes,
  templates: seedTemplates,
} satisfies Record<string, Item[]>;

export type NomCollection = keyof typeof SEEDS;
type Etat = Record<NomCollection, Item[]>;

const initial = () => JSON.parse(JSON.stringify(SEEDS)) as Etat;

type Ctx = {
  data: Etat;
  creer: (c: NomCollection, valeurs: Omit<Item, "id"> & { id?: string }) => Item;
  modifier: (c: NomCollection, id: string, valeurs: Partial<Item>) => void;
  supprimer: (c: NomCollection, id: string) => void;
  definir: (c: NomCollection, items: Item[]) => void;
  reinitialiser: () => void;
};

const AdminDataContext = createContext<Ctx | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Etat>(initial);

  useEffect(() => {
    try {
      const brut = localStorage.getItem(CLE);
      if (brut) setData({ ...initial(), ...(JSON.parse(brut) as Partial<Etat>) });
    } catch {
      /* données corrompues : on garde les seeds */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CLE, JSON.stringify(data));
    } catch {
      /* quota indisponible */
    }
  }, [data]);

  const creer = useCallback<Ctx["creer"]>((c, valeurs) => {
    const item = {
      ...valeurs,
      id: (valeurs.id as string) || `${c}-${Date.now().toString(36)}`,
    } as Item;
    setData((prev) => ({ ...prev, [c]: [item, ...prev[c]] }));
    return item;
  }, []);

  const modifier = useCallback<Ctx["modifier"]>((c, id, valeurs) => {
    setData((prev) => ({
      ...prev,
      [c]: prev[c].map((i) => (i.id === id ? { ...i, ...valeurs } : i)),
    }));
  }, []);

  const supprimer = useCallback<Ctx["supprimer"]>((c, id) => {
    setData((prev) => ({ ...prev, [c]: prev[c].filter((i) => i.id !== id) }));
  }, []);

  const definir = useCallback<Ctx["definir"]>((c, items) => {
    setData((prev) => ({ ...prev, [c]: items }));
  }, []);

  const reinitialiser = useCallback(() => setData(initial()), []);

  const value = useMemo(
    () => ({ data, creer, modifier, supprimer, definir, reinitialiser }),
    [data, creer, modifier, supprimer, definir, reinitialiser],
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData doit être utilisé dans <AdminDataProvider>");
  return ctx;
}

/** Accès CRUD à une collection. */
export function useCollection(nom: NomCollection) {
  const { data, creer, modifier, supprimer, definir } = useAdminData();

  const creerItem = useCallback(
    (v: Omit<Item, "id"> & { id?: string }) => creer(nom, v),
    [creer, nom],
  );
  const modifierItem = useCallback(
    (id: string, v: Partial<Item>) => modifier(nom, id, v),
    [modifier, nom],
  );
  const supprimerItem = useCallback((id: string) => supprimer(nom, id), [supprimer, nom]);
  const definirItems = useCallback((items: Item[]) => definir(nom, items), [definir, nom]);

  return useMemo(
    () => ({
      items: data[nom],
      creer: creerItem,
      modifier: modifierItem,
      supprimer: supprimerItem,
      definir: definirItems,
    }),
    [data, nom, creerItem, modifierItem, supprimerItem, definirItems],
  );
}
