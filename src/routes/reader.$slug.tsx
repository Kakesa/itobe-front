import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  List,
  Lock,
  Maximize2,
  Minus,
  Moon,
  Plus,
  Search,
  Sun,
  Unlock,
  X,
} from "lucide-react";
import { getLivre, nomAuteur, pageTexte, fetchLivreBySlug } from "@/lib/data";
import { useAccesLecture } from "@/hooks/use-acces-lecture";
import { useBibliothequeLivre } from "@/hooks/use-bibliotheque-livre";
import { ChapitresApi } from "@/lib/api-client";
import { ChapterJsonBody } from "@/components/reader/ChapterJsonBody";

export const Route = createFileRoute("/reader/$slug")({
  loader: async ({ params }) => {
    const livre = (await fetchLivreBySlug(params.slug)) ?? getLivre(params.slug);
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

interface DynamicChapitre {
  _id: string;
  titre: string;
  slug?: string;
  ordre: number;
  statut: string;
  gratuit: boolean;
  pages?: number[];
  contenu?: any;
  verrouille?: boolean;
}

function Reader() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { livre: livreCharge } = Route.useLoaderData();
  const livre = livreCharge ?? getLivre(slug);
  const cle = `itobe-reader-${livre.slug}`;

  const { accesComplet, loading: accesLoading } = useAccesLecture(slug, livre.apercuPages);
  const {
    favori,
    toggleFavori,
    marques,
    toggleMarque,
    pageInitiale,
    charge: bibCharge,
    sauverProgression,
    connecte,
  } = useBibliothequeLivre(slug, livre.pages);

  const [page, setPage] = useState(1);
  const [sombre, setSombre] = useState(false);
  const [taille, setTaille] = useState(18);
  const [sommaire, setSommaire] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [dynamicChapitres, setDynamicChapitres] = useState<DynamicChapitre[]>([]);
  const [chapitreIndexActif, setChapitreIndexActif] = useState(0);
  const pageInitAppliquee = useRef(false);

  // Chargement des chapitres dynamiques Tiptap depuis l'API MongoDB
  useEffect(() => {
    let actif = true;
    void ChapitresApi.getByLivre(slug)
      .then((res) => {
        const liste = res?.data ?? res ?? [];
        if (actif && Array.isArray(liste) && liste.length > 0) {
          setDynamicChapitres(liste);
        }
      })
      .catch(() => {
        // Fallback silencieux vers le mode paginé si non disponible
      });

    return () => {
      actif = false;
    };
  }, [slug]);

  // Reprise de lecture : API si connecté, sinon cache local (aperçu)
  useEffect(() => {
    if (pageInitAppliquee.current) return;
    if (connecte) {
      if (!bibCharge) return;
      setPage(pageInitiale);
      pageInitAppliquee.current = true;
      return;
    }
    const sauvegarde = localStorage.getItem(cle);
    if (sauvegarde) {
      const { page: p } = JSON.parse(sauvegarde);
      if (typeof p === "number") setPage(p);
    }
    pageInitAppliquee.current = true;
  }, [cle, connecte, bibCharge, pageInitiale]);

  useEffect(() => {
    if (connecte) return;
    localStorage.setItem(cle, JSON.stringify({ page }));
  }, [cle, page, connecte]);

  // Sauvegarde progression API (debounce)
  useEffect(() => {
    if (!connecte || !accesComplet) return;
    const t = setTimeout(() => void sauverProgression(page), 800);
    return () => clearTimeout(t);
  }, [page, connecte, accesComplet, sauverProgression]);

  const pagesGratuites = livre.apercuPages;
  const verrouilleLegacy = !accesLoading && !accesComplet && page > pagesGratuites;
  const chapitreVerrouille = (gratuit: boolean) => !accesComplet && !gratuit;

  const modeChapitresTiptap = dynamicChapitres.length > 0;

  const chapitreTiptapCourant = modeChapitresTiptap
    ? dynamicChapitres[chapitreIndexActif] || dynamicChapitres[0]
    : null;

  const estChapitreVerrouille =
    chapitreTiptapCourant &&
    !accesComplet &&
    !chapitreTiptapCourant.gratuit &&
    (chapitreTiptapCourant.verrouille || !chapitreTiptapCourant.contenu);

  const paragraphes = useMemo(() => pageTexte(livre, page), [livre, page]);
  const chapitreCourantLegacy = livre.chapitres?.find((c) => c.pages?.includes(page));

  const allerPage = (p: number) => setPage(Math.min(Math.max(1, p), livre.pages));

  const allerChapitreTiptap = (index: number) => {
    const idx = Math.max(0, Math.min(index, dynamicChapitres.length - 1));
    setChapitreIndexActif(idx);
    setSommaire(false);
  };

  const handleFavori = async () => {
    if (!connecte) {
      void navigate({ to: "/connexion", search: { redirect: `/reader/${slug}` } });
      return;
    }
    await toggleFavori();
  };

  const titreChapitreAffiche = modeChapitresTiptap
    ? chapitreTiptapCourant?.titre ?? `Chapitre ${chapitreIndexActif + 1}`
    : chapitreCourantLegacy?.titre ?? "Introduction";

  return (
    <div className={sombre ? "dark" : ""}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        {/* Barre supérieure */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur">
          <Link
            to="/edition/$slug"
            params={{ slug: livre.slug }}
            className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary transition"
            aria-label="Fermer le lecteur"
          >
            <X className="size-4" />
          </Link>
          <button
            onClick={() => setSommaire((v) => !v)}
            className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary transition"
            aria-label="Table des matières"
          >
            <List className="size-4" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-display text-sm font-semibold">{livre.titre}</p>
            <p className="truncate text-[0.7rem] text-muted-foreground">
              {titreChapitreAffiche}
            </p>
          </div>

          <button
            onClick={() => void toggleMarque(page)}
            className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary transition"
            aria-label="Marque-page"
          >
            <Bookmark className={`size-4 ${marques.includes(page) ? "fill-accent text-accent" : ""}`} />
          </button>
          <button
            onClick={() => void handleFavori()}
            className="hidden size-9 place-items-center rounded-full border border-border sm:grid hover:bg-secondary transition"
            aria-label="Favori"
          >
            <Heart className={`size-4 ${favori ? "fill-accent text-accent" : ""}`} />
          </button>
          <button
            onClick={() => setSombre((v) => !v)}
            className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary transition"
            aria-label="Mode clair/sombre"
          >
            {sombre ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="hidden size-9 place-items-center rounded-full border border-border sm:grid hover:bg-secondary transition"
            aria-label="Plein écran"
          >
            <Maximize2 className="size-4" />
          </button>
        </header>

        <div className="flex flex-1">
          {/* Sommaire / Table des matières */}
          {sommaire && (
            <aside className="w-80 shrink-0 border-r border-border bg-card p-4 overflow-y-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher dans le sommaire…"
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-accent"
                />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6">
                Table des matières
              </p>

              {modeChapitresTiptap ? (
                <ul className="mt-3 space-y-1.5">
                  {dynamicChapitres
                    .filter((c) => c.titre.toLowerCase().includes(recherche.toLowerCase()))
                    .map((c, idx) => {
                      const estActif = idx === chapitreIndexActif;
                      const estVerrou = !accesComplet && !c.gratuit;
                      return (
                        <li key={c._id}>
                          <button
                            onClick={() => allerChapitreTiptap(idx)}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${
                              estActif
                                ? "bg-accent/15 text-accent font-semibold"
                                : "hover:bg-secondary text-foreground"
                            }`}
                          >
                            <span className="truncate">
                              #{c.ordre} {c.titre}
                            </span>
                            {estVerrou ? (
                              <Lock className="size-3.5 shrink-0 text-muted-foreground" />
                            ) : c.gratuit ? (
                              <Unlock className="size-3.5 shrink-0 text-accent" />
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <ul className="mt-3 space-y-1">
                  {(livre.chapitres || [])
                    .filter((c) => c.titre.toLowerCase().includes(recherche.toLowerCase()))
                    .map((c) => (
                      <li key={c.titre}>
                        <button
                          onClick={() => {
                            allerPage(c.pages?.[0] ?? 1);
                            setSommaire(false);
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-secondary"
                        >
                          <span className="truncate">{c.titre}</span>
                          {chapitreVerrouille(c.gratuit) && (
                            <Lock className="size-3 shrink-0 text-muted-foreground" />
                          )}
                        </button>
                      </li>
                    ))}
                </ul>
              )}

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6">
                Marque-pages
              </p>
              {marques.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">Aucun marque-page enregistré.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {marques.map((m) => (
                    <li key={m}>
                      <button
                        onClick={() => allerPage(m)}
                        className="text-xs text-accent hover:underline"
                      >
                        Page {m}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          )}

          {/* Zone de lecture centrale */}
          <div className="flex-1 px-4 py-8 overflow-y-auto">
            <div className="mx-auto max-w-2xl">
              {/* Cas 1 : Chapitres Tiptap JSON */}
              {modeChapitresTiptap ? (
                estChapitreVerrouille ? (
                  <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-xs">
                    <Lock className="mx-auto size-8 text-accent" />
                    <h2 className="mt-4 font-display text-2xl">Chapitre réservé aux abonnés & acheteurs</h2>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      Ce chapitre fait partie de la version intégrale de l'ouvrage « {livre.titre} ».
                      Achetez le livre ou activez votre pass lecture pour continuer.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Link
                        to="/edition/$slug"
                        params={{ slug: livre.slug }}
                        className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-foreground shadow-xs hover:bg-accent/90 transition"
                      >
                        Débloquer — {(livre.promo ?? livre.prix).toFixed(2)} $
                      </Link>
                      <button
                        onClick={() => allerChapitreTiptap(0)}
                        className="rounded-xl border border-border px-5 py-3 text-sm font-medium hover:bg-secondary"
                      >
                        Revenir au premier chapitre
                      </button>
                    </div>
                  </div>
                ) : (
                  <article className="animate-reader-page space-y-6">
                    <div className="border-b border-border pb-4 mb-6 text-center">
                      <span className="text-xs uppercase font-semibold text-accent tracking-wider">
                        Chapitre {chapitreTiptapCourant?.ordre}
                      </span>
                      <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1 text-foreground">
                        {chapitreTiptapCourant?.titre}
                      </h1>
                    </div>

                    <ChapterJsonBody
                      content={chapitreTiptapCourant?.contenu}
                      taillePolice={taille}
                    />

                    <div className="pt-8 border-t border-border text-center text-xs text-muted-foreground">
                      {nomAuteur(livre.auteur)} — {livre.titre}
                      {accesComplet ? " · Accès complet" : " · Aperçu gratuit"}
                    </div>
                  </article>
                )
              ) : verrouilleLegacy ? (
                /* Cas 2 : Verrouillage aperçu gratuit */
                <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-xs">
                  <Lock className="mx-auto size-8 text-accent" />
                  <h2 className="mt-4 font-display text-2xl">Fin de l'aperçu gratuit</h2>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    Vous avez lu les {pagesGratuites} premières pages ({livre.apercuPourcent} % de
                    l'ouvrage). Achetez le livre pour continuer votre lecture.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      to="/edition/$slug"
                      params={{ slug: livre.slug }}
                      className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-foreground shadow-xs hover:bg-accent/90"
                    >
                      Acheter — {(livre.promo ?? livre.prix).toFixed(2)} $
                    </Link>
                    <button
                      onClick={() => allerPage(pagesGratuites)}
                      className="rounded-xl border border-border px-5 py-3 text-sm font-medium hover:bg-secondary"
                    >
                      Revenir à l'aperçu
                    </button>
                  </div>
                </div>
              ) : (
                /* Cas 3 : Texte paginé fluide */
                <article
                  key={page}
                  className="animate-reader-page no-select space-y-5 leading-relaxed"
                  style={{ fontSize: `${taille}px` }}
                  onCopy={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <p className="text-xs uppercase font-semibold text-accent tracking-wider">
                    {chapitreCourantLegacy?.titre}
                  </p>
                  {paragraphes.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  <p className="pt-6 text-center text-xs text-muted-foreground">
                    {nomAuteur(livre.auteur)} — {livre.titre}
                    {accesComplet ? " · Accès complet" : " · Exemplaire filigrané"}
                  </p>
                </article>
              )}
            </div>
          </div>
        </div>

        {/* Barre inférieure de navigation */}
        <footer className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            {modeChapitresTiptap ? (
              <>
                <button
                  onClick={() => allerChapitreTiptap(chapitreIndexActif - 1)}
                  disabled={chapitreIndexActif === 0}
                  className="grid size-9 place-items-center rounded-full border border-border disabled:opacity-30 hover:bg-secondary"
                  aria-label="Chapitre précédent"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <div className="flex-1 text-center">
                  <p className="text-xs font-semibold text-foreground">
                    Chapitre {chapitreIndexActif + 1} sur {dynamicChapitres.length}
                  </p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {accesComplet ? "Accès complet" : "Aperçu lecteur"}
                  </p>
                </div>

                <button
                  onClick={() => allerChapitreTiptap(chapitreIndexActif + 1)}
                  disabled={chapitreIndexActif === dynamicChapitres.length - 1}
                  className="grid size-9 place-items-center rounded-full border border-border disabled:opacity-30 hover:bg-secondary"
                  aria-label="Chapitre suivant"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => allerPage(page - 1)}
                  className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary"
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
                    onChange={(e) => allerPage(Number(e.target.value))}
                    className="w-full accent-[var(--accent)]"
                    aria-label="Progression"
                  />
                  <p className="mt-1 text-center text-[0.7rem] text-muted-foreground">
                    Page {page} / {livre.pages} · {Math.round((page / livre.pages) * 100)} %
                    {accesComplet ? " · accès complet" : " · aperçu gratuit"}
                  </p>
                </div>

                <button
                  onClick={() => allerPage(page + 1)}
                  className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}

            <div className="hidden items-center gap-1 sm:flex ml-2 border-l border-border pl-2">
              <button
                onClick={() => setTaille((t) => Math.max(14, t - 1))}
                className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary"
                aria-label="Réduire le texte"
              >
                <Minus className="size-4" />
              </button>
              <button
                onClick={() => setTaille((t) => Math.min(26, t + 1))}
                className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary"
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
