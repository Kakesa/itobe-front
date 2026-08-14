import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight, List, RefreshCw } from "lucide-react";
import { AccesRestreint } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";
import { useAdminData } from "@/lib/admin/store";
import {
  LIBELLE_TYPE,
  TONS_STATUT,
  bornesDuMois,
  dansPeriode,
  grilleDuMois,
  libelleMois,
  moisSuivant,
  versElement,
  type ElementCalendrier,
  type ReponseCalendrier,
  type TypeElement,
} from "@/lib/calendrier/editorial";

export const Route = createFileRoute("/admin/calendrier")({
  component: CalendrierEditorial,
  head: () => ({
    meta: [
      { title: "Calendrier éditorial — Itobe Admin" },
      {
        name: "description",
        content:
          "Vue mensuelle des articles, actualités et livres d'Itobe avec leurs statuts éditoriaux.",
      },
      { property: "og:title", content: "Calendrier éditorial — Itobe Admin" },
      {
        property: "og:description",
        content: "Planification des publications Média et Édition d'Itobe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const TYPES: (TypeElement | "tous")[] = ["tous", "article", "actualite", "livre"];

const TON_TYPE: Record<TypeElement, string> = {
  article: "border-l-2 border-primary",
  actualite: "border-l-2 border-ochre",
  livre: "border-l-2 border-accent",
};

function CalendrierEditorial() {
  const { role } = useRole();
  const { data: store } = useAdminData();
  const [mois, setMois] = useState(() => new Date().toISOString().slice(0, 7));
  const [type, setType] = useState<TypeElement | "tous">("tous");
  const [statut, setStatut] = useState("Tous");
  const [vue, setVue] = useState<"mois" | "liste">("mois");

  const { debut, fin } = bornesDuMois(mois);

  const requete = useQuery({
    queryKey: ["calendrier-editorial", debut, fin],
    queryFn: async (): Promise<ReponseCalendrier> => {
      const res = await fetch(`/admin/editorial-calendar?debut=${debut}&fin=${fin}`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error("Impossible de charger la période du calendrier.");
      return (await res.json()) as ReponseCalendrier;
    },
  });

  // Les éditions locales (store admin) priment sur la réponse serveur.
  const elements = useMemo<ElementCalendrier[]>(() => {
    const locaux = [
      ...store.articles.map((i) => versElement("article", i)),
      ...store.actualites.map((i) => versElement("actualite", i)),
      ...store.livres.map((i) => versElement("livre", i)),
    ].filter((e): e is ElementCalendrier => e !== null);

    const carte = new Map<string, ElementCalendrier>();
    for (const e of requete.data?.elements ?? []) carte.set(`${e.type}:${e.id}`, e);
    for (const e of locaux) carte.set(`${e.type}:${e.id}`, e);

    return [...carte.values()]
      .filter((e) => dansPeriode(e, debut, fin))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [store, requete.data, debut, fin]);

  const statuts = useMemo(
    () => ["Tous", ...new Set(elements.map((e) => e.statut))],
    [elements],
  );

  const filtres = elements.filter(
    (e) => (type === "tous" || e.type === type) && (statut === "Tous" || e.statut === statut),
  );

  const parJour = useMemo(() => {
    const m = new Map<string, ElementCalendrier[]>();
    for (const e of filtres) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    return m;
  }, [filtres]);

  if (role !== "admin" && role !== "editeur") {
    return <AccesRestreint requis={["admin", "editeur"]} />;
  }

  const jours = grilleDuMois(mois);

  return (
    <div>
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Contenu
        </p>
        <h1 className="mt-1 font-display text-3xl">Calendrier éditorial</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Articles, actualités et livres de la période, récupérés via{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-xs">
            GET /admin/editorial-calendar
          </code>{" "}
          et fusionnés avec vos modifications locales.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Mois précédent"
            onClick={() => setMois((m) => moisSuivant(m, -1))}
            className="rounded-lg border border-border p-1.5 hover:bg-secondary"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[10rem] text-center text-sm font-medium capitalize">
            {libelleMois(mois)}
          </span>
          <button
            type="button"
            aria-label="Mois suivant"
            onClick={() => setMois((m) => moisSuivant(m, 1))}
            className="rounded-lg border border-border p-1.5 hover:bg-secondary"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as TypeElement | "tous")}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "tous" ? "Tous les types" : LIBELLE_TYPE[t]}
            </option>
          ))}
        </select>

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        >
          {statuts.map((s) => (
            <option key={s}>{s === "Tous" ? "Tous les statuts" : s}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => void requete.refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary"
          >
            <RefreshCw className={`size-4 ${requete.isFetching ? "animate-spin" : ""}`} />
            Actualiser
          </button>
          <div className="flex rounded-lg border border-border p-0.5">
            {(["mois", "liste"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVue(v)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm ${
                  vue === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {v === "mois" ? <CalendarDays className="size-4" /> : <List className="size-4" />}
                {v === "mois" ? "Mois" : "Liste"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {requete.isError && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(requete.error as Error).message}
        </p>
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        {filtres.length} élément(s) du {debut} au {fin}
        {requete.isLoading ? " — chargement…" : ""}
      </p>

      {vue === "mois" ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border text-xs text-muted-foreground">
            {JOURS.map((j) => (
              <div key={j} className="px-2 py-2 text-center">
                {j}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {jours.map((jour) => {
              const hors = jour.slice(0, 7) !== mois;
              const items = parJour.get(jour) ?? [];
              return (
                <div
                  key={jour}
                  className={`min-h-[104px] border-b border-r border-border p-1.5 ${
                    hors ? "bg-secondary/40 text-muted-foreground/60" : ""
                  }`}
                >
                  <div className="mb-1 text-[0.7rem]">{Number(jour.slice(8, 10))}</div>
                  <div className="space-y-1">
                    {items.map((e) => (
                      <Link
                        key={`${e.type}:${e.id}`}
                        to={e.lien ?? "/admin"}
                        title={`${LIBELLE_TYPE[e.type]} — ${e.statut}`}
                        className={`block rounded bg-background px-1.5 py-1 text-[0.7rem] leading-tight hover:bg-secondary ${TON_TYPE[e.type]}`}
                      >
                        <span className="line-clamp-2">{e.titre}</span>
                        <span
                          className={`mt-1 inline-block rounded-full px-1.5 text-[0.6rem] ${TONS_STATUT[e.statut]}`}
                        >
                          {e.statut}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Titre</th>
                <th className="px-4 py-3 font-normal">Type</th>
                <th className="px-4 py-3 font-normal">Catégorie</th>
                <th className="px-4 py-3 font-normal">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtres.map((e) => (
                <tr key={`${e.type}:${e.id}`}>
                  <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link to={e.lien ?? "/admin"} className="hover:underline">
                      {e.titre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{LIBELLE_TYPE[e.type]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.categorie ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${TONS_STATUT[e.statut]}`}
                    >
                      {e.statut}
                    </span>
                  </td>
                </tr>
              ))}
              {filtres.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Aucun contenu planifié sur cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
