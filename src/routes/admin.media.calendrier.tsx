import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { AccesRestreint } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";
import { useAdminData, type NomCollection } from "@/lib/admin/store";
import { notify } from "@/lib/notify";
import {
  CreationRapide,
  PanneauDetail,
  type BrouillonRapide,
} from "@/components/admin/calendrier-panneau";
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

export const Route = createFileRoute("/admin/media/calendrier")({
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
const TYPES: TypeElement[] = ["article", "actualite", "livre"];

const TON_TYPE: Record<TypeElement, string> = {
  article: "border-l-2 border-primary",
  actualite: "border-l-2 border-ochre",
  livre: "border-l-2 border-accent",
};

const COLLECTION: Record<TypeElement, NomCollection> = {
  article: "articles",
  actualite: "actualites",
  livre: "livres",
};

const CHAMP_DATE = (type: TypeElement) => (type === "livre" ? "publication" : "date");

function CalendrierEditorial() {
  const { role } = useRole();
  const { data: store, creer, modifier } = useAdminData();
  const [mois, setMois] = useState(() => new Date().toISOString().slice(0, 7));
  const [types, setTypes] = useState<TypeElement[]>([]);
  const [statuts, setStatuts] = useState<string[]>([]);
  const [recherche, setRecherche] = useState("");
  const [auteur, setAuteur] = useState("Tous");
  const [categorie, setCategorie] = useState("Toutes");
  const [vue, setVue] = useState<"mois" | "liste">("mois");
  const [selection, setSelection] = useState<string | null>(null);
  const [creation, setCreation] = useState<string | null>(null);
  const [glisse, setGlisse] = useState<string | null>(null);

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

  const statutsDispo = useMemo(
    () => [...new Set(elements.map((e) => e.statut))],
    [elements],
  );
  const auteursDispo = useMemo(
    () => [...new Set(elements.map((e) => e.auteur).filter(Boolean))] as string[],
    [elements],
  );
  const categoriesDispo = useMemo(
    () => [...new Set(elements.map((e) => e.categorie).filter(Boolean))] as string[],
    [elements],
  );

  const q = recherche.trim().toLowerCase();
  const filtres = elements.filter(
    (e) =>
      (types.length === 0 || types.includes(e.type)) &&
      (statuts.length === 0 || statuts.includes(e.statut)) &&
      (auteur === "Tous" || e.auteur === auteur) &&
      (categorie === "Toutes" || e.categorie === categorie) &&
      (q === "" ||
        e.titre.toLowerCase().includes(q) ||
        (e.auteur ?? "").toLowerCase().includes(q) ||
        (e.categorie ?? "").toLowerCase().includes(q)),
  );

  const parJour = useMemo(() => {
    const m = new Map<string, ElementCalendrier[]>();
    for (const e of filtres) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    return m;
  }, [filtres]);

  const elementSelectionne =
    filtres.find((e) => `${e.type}:${e.id}` === selection) ??
    elements.find((e) => `${e.type}:${e.id}` === selection) ??
    null;

  const basculer = <T,>(liste: T[], set: (v: T[]) => void, valeur: T) =>
    set(liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur]);

  const deplacer = (e: ElementCalendrier, date: string) => {
    if (!date || date === e.date) return;
    modifier(COLLECTION[e.type], e.id, { [CHAMP_DATE(e.type)]: date });
    notify.succes("Publication reprogrammée", { description: `${e.titre} → ${date}` });
  };

  const dupliquer = (e: ElementCalendrier) => {
    const source = (store[COLLECTION[e.type]] ?? []).find((i) => i.id === e.id);
    const { id: _ignore, ...reste } = (source ?? {}) as Record<string, unknown>;
    const copie = creer(COLLECTION[e.type], {
      ...reste,
      titre: `${e.titre} (copie)`,
      [CHAMP_DATE(e.type)]: e.date,
    } as never);
    setSelection(`${e.type}:${copie.id}`);
    notify.cree(LIBELLE_TYPE[e.type], `${e.titre} (copie)`);
  };

  const creerRapide = (v: BrouillonRapide) => {
    const base: Record<string, unknown> = {
      titre: v.titre,
      [CHAMP_DATE(v.type)]: v.date,
      ...(v.categorie ? { categorie: v.categorie } : {}),
      ...(v.auteur ? { auteur: v.auteur } : {}),
    };
    if (v.type === "livre") {
      base["disponible"] = v.statut === "En vente";
      base["prix"] = 0;
      base["stock"] = 0;
    } else {
      base["statut"] = v.statut;
      base["etat"] = v.statut;
    }
    const item = creer(COLLECTION[v.type], base as never);
    setCreation(null);
    setSelection(`${v.type}:${item.id}`);
    notify.cree(LIBELLE_TYPE[v.type], `${v.titre} — ${v.date}`);
  };

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
          et fusionnés avec vos modifications locales. Glissez un élément sur une autre
          case pour le reprogrammer.
        </p>
      </header>

      <div className="space-y-3 rounded-xl border border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-3">
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

          <label className="relative flex-1 min-w-[14rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par titre, auteur ou catégorie…"
              className="w-full rounded-lg border border-border bg-background py-1.5 pl-9 pr-3 text-sm"
            />
          </label>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreation(`${mois}-01`)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              <Plus className="size-4" />
              Créer
            </button>
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Types :</span>
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => basculer(types, setTypes, t)}
              className={`rounded-full border px-3 py-1 text-xs ${
                types.includes(t)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {LIBELLE_TYPE[t]}
            </button>
          ))}

          <span className="ml-3 text-xs text-muted-foreground">Statuts :</span>
          {statutsDispo.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => basculer(statuts, setStatuts, s)}
              className={`rounded-full border px-3 py-1 text-xs ${
                statuts.includes(s)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={auteur}
            onChange={(e) => setAuteur(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option>Tous</option>
            {auteursDispo.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option>Toutes</option>
            {categoriesDispo.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {(types.length > 0 ||
            statuts.length > 0 ||
            recherche ||
            auteur !== "Tous" ||
            categorie !== "Toutes") && (
            <button
              type="button"
              onClick={() => {
                setTypes([]);
                setStatuts([]);
                setRecherche("");
                setAuteur("Tous");
                setCategorie("Toutes");
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary"
            >
              Réinitialiser les filtres
            </button>
          )}
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

      <div
        className={`mt-3 grid gap-4 ${elementSelectionne ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}
      >
        {vue === "mois" ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
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
                    onDragOver={(ev) => ev.preventDefault()}
                    onDrop={() => {
                      const cle = glisse;
                      setGlisse(null);
                      const el = elements.find((e) => `${e.type}:${e.id}` === cle);
                      if (el) deplacer(el, jour);
                    }}
                    className={`group relative min-h-[104px] border-b border-r border-border p-1.5 ${
                      hors ? "bg-secondary/40 text-muted-foreground/60" : ""
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between text-[0.7rem]">
                      <span>{Number(jour.slice(8, 10))}</span>
                      <button
                        type="button"
                        aria-label={`Programmer le ${jour}`}
                        onClick={() => setCreation(jour)}
                        className="opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {items.map((e) => {
                        const cle = `${e.type}:${e.id}`;
                        return (
                          <button
                            key={cle}
                            type="button"
                            draggable
                            onDragStart={() => setGlisse(cle)}
                            onDragEnd={() => setGlisse(null)}
                            onClick={() => setSelection(cle)}
                            title={`${LIBELLE_TYPE[e.type]} — ${e.statut}`}
                            className={`block w-full cursor-grab rounded bg-background px-1.5 py-1 text-left text-[0.7rem] leading-tight hover:bg-secondary active:cursor-grabbing ${
                              TON_TYPE[e.type]
                            } ${selection === cle ? "ring-1 ring-primary" : ""}`}
                          >
                            <span className="line-clamp-2">{e.titre}</span>
                            <span
                              className={`mt-1 inline-block rounded-full px-1.5 text-[0.6rem] ${TONS_STATUT[e.statut]}`}
                            >
                              {e.statut}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-normal">Date</th>
                  <th className="px-4 py-3 font-normal">Titre</th>
                  <th className="px-4 py-3 font-normal">Type</th>
                  <th className="px-4 py-3 font-normal">Auteur</th>
                  <th className="px-4 py-3 font-normal">Catégorie</th>
                  <th className="px-4 py-3 font-normal">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtres.map((e) => (
                  <tr
                    key={`${e.type}:${e.id}`}
                    onClick={() => setSelection(`${e.type}:${e.id}`)}
                    className="cursor-pointer hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                    <td className="px-4 py-3 font-medium">
                      <Link
                        to={e.lien ?? "/admin"}
                        onClick={(ev) => ev.stopPropagation()}
                        className="hover:underline"
                      >
                        {e.titre}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{LIBELLE_TYPE[e.type]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.auteur ?? "—"}</td>
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
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Aucun contenu planifié sur cette période.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {elementSelectionne && (
          <PanneauDetail
            element={elementSelectionne}
            onFermer={() => setSelection(null)}
            onDeplacer={deplacer}
            onDupliquer={dupliquer}
          />
        )}
      </div>

      {creation && (
        <CreationRapide
          dateInitiale={creation}
          onFermer={() => setCreation(null)}
          onCreer={creerRapide}
        />
      )}
    </div>
  );
}
