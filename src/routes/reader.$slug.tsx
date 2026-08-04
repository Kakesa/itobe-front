import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  List,
  Lock,
  Maximize2,
  Minus,
  Moon,
  Plus,
  Search,
  Sun,
  X,
} from "lucide-react";
import { getLivre, nomAuteur, pageTexte } from "@/lib/data";

export const Route = createFileRoute("/reader/$slug")({
  loader: ({ params }) => {
    const livre = getLivre(params.slug);
    if (!livre) throw notFound();
    return { livre };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Lecture — ${loaderData.livre.titre} | Itobe` : "Lecture | Itobe" },
      { name: "description", content: "Reader intégré Itobe : lisez vos ouvrages en ligne." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reader,
});

function Reader() {
  const { livre } = Route.useLoaderData();
  const cle = `itobe-reader-${livre.slug}`;

  const [page, setPage] = useState(1);
  const [sombre, setSombre] = useState(false);
  const [taille, setTaille] = useState(18);
  const [sommaire, setSommaire] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [marques, setMarques] = useState<number[]>([]);
  const [favori, setFavori] = useState(false);

  // Reprise de lecture (démo locale)
  useEffect(() => {
    const sauvegarde = localStorage.getItem(cle);
    if (sauvegarde) {
      const { page: p, marques: m } = JSON.parse(sauvegarde);
      if (typeof p === "number") setPage(p);
      if (Array.isArray(m)) setMarques(m);
    }
  }, [cle]);

  useEffect(() => {
    localStorage.setItem(cle, JSON.stringify({ page, marques }));
  }, [cle, page, marques]);

  const pagesGratuites = livre.apercuPages;
  const verrouille = page > pagesGratuites;
  const paragraphes = useMemo(() => pageTexte(livre, page), [livre, page]);
  const chapitreCourant = livre.chapitres.find((c) => c.pages.includes(page));

  const aller = (p: number) => setPage(Math.min(Math.max(1, p), livre.pages));

  return (
    <div className={sombre ? "dark" : ""}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        {/* Barre supérieure */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur">
          <Link
            to="/edition/$slug"
            params={{ slug: livre.slug }}
            className="grid size-9 place-items-center rounded-full border border-border"
            aria-label="Fermer le lecteur"
          >
            <X className="size-4" />
          </Link>
          <button
            onClick={() => setSommaire((v) => !v)}
            className="grid size-9 place-items-center rounded-full border border-border"
            aria-label="Table des matières"
          >
            <List className="size-4" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-display text-sm">{livre.titre}</p>
            <p className="truncate text-[0.7rem] text-muted-foreground">
              {chapitreCourant?.titre ?? "Introduction"}
            </p>
          </div>

          <button
            onClick={() =>
              setMarques((m) => (m.includes(page) ? m.filter((x) => x !== page) : [...m, page]))
            }
            className="grid size-9 place-items-center rounded-full border border-border"
            aria-label="Marque-page"
          >
            <Bookmark className={`size-4 ${marques.includes(page) ? "fill-accent text-accent" : ""}`} />
          </button>
          <button
            onClick={() => setFavori((v) => !v)}
            className="hidden size-9 place-items-center rounded-full border border-border sm:grid"
            aria-label="Favori"
          >
            <Heart className={`size-4 ${favori ? "fill-accent text-accent" : ""}`} />
          </button>
          <button
            onClick={() => setSombre((v) => !v)}
            className="grid size-9 place-items-center rounded-full border border-border"
            aria-label="Mode clair/sombre"
          >
            {sombre ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="hidden size-9 place-items-center rounded-full border border-border sm:grid"
            aria-label="Plein écran"
          >
            <Maximize2 className="size-4" />
          </button>
        </header>

        <div className="flex flex-1">
          {/* Sommaire */}
          {sommaire && (
            <aside className="w-72 shrink-0 border-r border-border bg-card p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher dans le livre"
                  className="w-full rounded-sm border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
                />
              </div>

              <p className="kicker mt-6">Table des matières</p>
              <ul className="mt-3 space-y-1">
                {livre.chapitres
                  .filter((c) => c.titre.toLowerCase().includes(recherche.toLowerCase()))
                  .map((c) => (
                    <li key={c.titre}>
                      <button
                        onClick={() => aller(c.pages[0] ?? 1)}
                        className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-secondary"
                      >
                        <span className="truncate">{c.titre}</span>
                        {!c.gratuit && <Lock className="size-3 shrink-0 text-muted-foreground" />}
                      </button>
                    </li>
                  ))}
              </ul>

              <p className="kicker mt-6">Marque-pages</p>
              {marques.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">Aucun marque-page.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {marques.map((m) => (
                    <li key={m}>
                      <button
                        onClick={() => aller(m)}
                        className="text-sm text-accent hover:underline"
                      >
                        Page {m}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          )}

          {/* Page */}
          <div className="flex-1 px-4 py-10">
            <div className="mx-auto max-w-2xl">
              {verrouille ? (
                <div className="rounded-sm border border-border bg-card p-10 text-center">
                  <Lock className="mx-auto size-6 text-accent" />
                  <h2 className="mt-4 text-2xl">Fin de l'aperçu gratuit</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Vous avez lu les {pagesGratuites} premières pages ({livre.apercuPourcent} % de
                    l'ouvrage). Achetez le livre pour continuer votre lecture.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      to="/edition/$slug"
                      params={{ slug: livre.slug }}
                      className="rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
                    >
                      Acheter — {(livre.promo ?? livre.prix).toFixed(2)} $
                    </Link>
                    <button
                      onClick={() => aller(pagesGratuites)}
                      className="rounded-sm border border-border px-5 py-3 text-sm font-medium"
                    >
                      Revenir à l'aperçu
                    </button>
                  </div>
                </div>
              ) : (
                <article
                  className="no-select space-y-5 leading-relaxed"
                  style={{ fontSize: `${taille}px` }}
                  onCopy={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <p className="kicker">{chapitreCourant?.titre}</p>
                  {paragraphes.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  <p className="pt-6 text-center text-xs text-muted-foreground">
                    {nomAuteur(livre.auteur)} — {livre.titre} · exemplaire filigrané
                  </p>
                </article>
              )}
            </div>
          </div>
        </div>

        {/* Barre inférieure */}
        <footer className="sticky bottom-0 border-t border-border bg-background/95 px-3 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <button
              onClick={() => aller(page - 1)}
              className="grid size-9 place-items-center rounded-full border border-border"
              aria-label="Page précédente"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex-1">
              <input
                type="range"
                min={1}
                max={livre.pages}
                value={page}
                onChange={(e) => aller(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
                aria-label="Progression"
              />
              <p className="mt-1 text-center text-[0.7rem] text-muted-foreground">
                Page {page} / {livre.pages} · {Math.round((page / livre.pages) * 100)} % ·
                progression synchronisée
              </p>
            </div>

            <button
              onClick={() => aller(page + 1)}
              className="grid size-9 place-items-center rounded-full border border-border"
              aria-label="Page suivante"
            >
              <ChevronRight className="size-4" />
            </button>

            <div className="hidden items-center gap-1 sm:flex">
              <button
                onClick={() => setTaille((t) => Math.max(14, t - 1))}
                className="grid size-9 place-items-center rounded-full border border-border"
                aria-label="Réduire le texte"
              >
                <Minus className="size-4" />
              </button>
              <button
                onClick={() => setTaille((t) => Math.min(26, t + 1))}
                className="grid size-9 place-items-center rounded-full border border-border"
                aria-label="Agrandir le texte"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
