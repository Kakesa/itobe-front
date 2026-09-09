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
import { getLivre, pageTexte, fetchLivreBySlug } from "@/lib/data";
import { useAccesLecture } from "@/hooks/use-acces-lecture";
import { useBibliothequeLivre } from "@/hooks/use-bibliotheque-livre";
import { ChapitresApi, PagesApi } from "@/lib/api-client";
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

interface ReaderPage {
  _id: string;
  titre: string;
  ordre: number;
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
  const [pagesChapitre, setPagesChapitre] = useState<ReaderPage[]>([]);
  const [pageIndexActif, setPageIndexActif] = useState(0);
  const [chargementPages, setChargementPages] = useState(false);
  /** Desktop : double page (verso|recto). Mobile : une page à la fois. */
  const [doublePage, setDoublePage] = useState(false);
  const pageInitAppliquee = useRef(false);
  /** Si true, après chargement des pages du chapitre on ouvre la dernière. */
  const ouvrirDernierePageRef = useRef(false);
  const zoneLectureRef = useRef<HTMLDivElement>(null);

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

  // Pages éditoriales du chapitre actif (source de vérité si présentes)
  const chapitreActifId = dynamicChapitres[chapitreIndexActif]?._id;

  useEffect(() => {
    if (!chapitreActifId) {
      setPagesChapitre([]);
      setPageIndexActif(0);
      return;
    }

    let actif = true;
    setChargementPages(true);
    void PagesApi.getByChapitre(chapitreActifId)
      .then((res) => {
        const liste: ReaderPage[] = res?.data ?? res ?? [];
        if (!actif) return;
        const pages = Array.isArray(liste) ? liste : [];
        setPagesChapitre(pages);
        if (ouvrirDernierePageRef.current && pages.length > 0) {
          setPageIndexActif(pages.length - 1);
          ouvrirDernierePageRef.current = false;
        } else {
          setPageIndexActif(0);
        }
      })
      .catch(() => {
        if (actif) {
          setPagesChapitre([]);
          setPageIndexActif(0);
          ouvrirDernierePageRef.current = false;
        }
      })
      .finally(() => {
        if (actif) setChargementPages(false);
      });

    return () => {
      actif = false;
    };
  }, [chapitreActifId]);

  // Remonter en haut à chaque changement de page/chapitre
  useEffect(() => {
    zoneLectureRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [chapitreIndexActif, pageIndexActif]);

  // Double page sur grand écran uniquement
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 821px)");
    const sync = () => setDoublePage(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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
  /** Nouveau mode : Pages éditoriales présentes → lecture page par page */
  const modePagesEditoriales = modeChapitresTiptap && pagesChapitre.length > 0;

  const chapitreTiptapCourant = modeChapitresTiptap
    ? dynamicChapitres[chapitreIndexActif] || dynamicChapitres[0]
    : null;

  const pageEditorialeCourante = modePagesEditoriales
    ? pagesChapitre[pageIndexActif] || pagesChapitre[0]
    : null;

  /** Index de la page de gauche du feuillet (pair en mode double page). */
  const indexPageGauche = modePagesEditoriales
    ? doublePage
      ? Math.floor(pageIndexActif / 2) * 2
      : pageIndexActif
    : 0;
  const pageGauche = modePagesEditoriales ? pagesChapitre[indexPageGauche] : null;
  const pageDroite =
    modePagesEditoriales && doublePage ? pagesChapitre[indexPageGauche + 1] ?? null : null;
  const pasNavigationPages = modePagesEditoriales && doublePage ? 2 : 1;

  const estChapitreVerrouille =
    chapitreTiptapCourant &&
    !accesComplet &&
    !chapitreTiptapCourant.gratuit &&
    (chapitreTiptapCourant.verrouille ||
      (modePagesEditoriales
        ? !pageGauche?.contenu && !pageEditorialeCourante?.contenu
        : !chapitreTiptapCourant.contenu));

  /** Contenu affiché (legacy chapitre sans pages éditoriales). */
  const contenuLecture = modePagesEditoriales
    ? pageGauche?.contenu
    : chapitreTiptapCourant?.contenu;

  const paragraphes = useMemo(() => pageTexte(livre, page), [livre, page]);
  const paragraphesDroite = useMemo(
    () => (doublePage ? pageTexte(livre, page + 1) : []),
    [livre, page, doublePage],
  );
  const chapitreCourantLegacy = livre.chapitres?.find((c) => c.pages?.includes(page));

  const allerPage = (p: number) => setPage(Math.min(Math.max(1, p), livre.pages));

  const allerChapitreTiptap = (index: number, options?: { dernierePage?: boolean }) => {
    const idx = Math.max(0, Math.min(index, dynamicChapitres.length - 1));
    ouvrirDernierePageRef.current = Boolean(options?.dernierePage);
    setChapitreIndexActif(idx);
    setSommaire(false);
  };

  const allerPageEditoriale = (index: number) => {
    const idx = Math.max(0, Math.min(index, pagesChapitre.length - 1));
    setPageIndexActif(idx);
    setSommaire(false);
  };

  const allerPrecedentTiptap = () => {
    if (modePagesEditoriales) {
      if (indexPageGauche > 0) {
        allerPageEditoriale(Math.max(0, indexPageGauche - pasNavigationPages));
        return;
      }
      if (chapitreIndexActif > 0) {
        allerChapitreTiptap(chapitreIndexActif - 1, { dernierePage: true });
      }
      return;
    }
    allerChapitreTiptap(chapitreIndexActif - 1);
  };

  const allerSuivantTiptap = () => {
    if (modePagesEditoriales) {
      const prochain = indexPageGauche + pasNavigationPages;
      if (prochain < pagesChapitre.length) {
        allerPageEditoriale(prochain);
        return;
      }
      if (chapitreIndexActif < dynamicChapitres.length - 1) {
        allerChapitreTiptap(chapitreIndexActif + 1);
      }
      return;
    }
    allerChapitreTiptap(chapitreIndexActif + 1);
  };

  const debutNavigationTiptap =
    chapitreIndexActif === 0 && (!modePagesEditoriales || indexPageGauche === 0);
  const finNavigationTiptap =
    chapitreIndexActif === dynamicChapitres.length - 1 &&
    (!modePagesEditoriales ||
      indexPageGauche + (pageDroite ? 1 : 0) >= pagesChapitre.length - 1);

  const labelPagesEditoriales = (() => {
    if (!modePagesEditoriales || !pageGauche) return "";
    if (pageDroite) {
      return `Pages ${indexPageGauche + 1}–${indexPageGauche + 2} / ${pagesChapitre.length}`;
    }
    return `Page ${indexPageGauche + 1} / ${pagesChapitre.length}`;
  })();

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

  const sousTitrePage =
    modePagesEditoriales && pageGauche
      ? `${labelPagesEditoriales} · ${titreChapitreAffiche}`
      : titreChapitreAffiche;

  return (
    <div className={sombre ? "dark" : ""}>
      <div className="flex h-dvh min-h-0 flex-col bg-background text-foreground">
        {/* Barre supérieure */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur">
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
              {sousTitrePage}
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

        <div className="flex min-h-0 flex-1">
          {/* Sommaire / Table des matières */}
          {sommaire && (
            <aside className="sticky top-14 z-20 h-[calc(100vh-3.5rem)] w-80 shrink-0 overflow-y-auto border-r border-border bg-card p-4">
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
                          {estActif && modePagesEditoriales && (
                            <ul className="ml-3 mt-1 space-y-0.5 border-l border-border pl-2">
                              {pagesChapitre.map((p, pIdx) => (
                                <li key={p._id}>
                                  <button
                                    type="button"
                                    onClick={() => allerPageEditoriale(pIdx)}
                                    className={`w-full truncate rounded-md px-2 py-1.5 text-left text-[0.7rem] transition ${
                                      pIdx === indexPageGauche ||
                                      (pageDroite && pIdx === indexPageGauche + 1)
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                                  >
                                    {p.titre || `Page ${p.ordre}`}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
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

          {/* Zone de lecture centrale — occupe toute la surface entre header et footer */}
          <div ref={zoneLectureRef} className="reader-surface min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-8 lg:px-12">
            <div className="reader-page-sheet mx-auto flex min-h-full w-full flex-col">
              {/* Cas 1 : Chapitres Tiptap JSON (+ Pages éditoriales si présentes) */}
              {modeChapitresTiptap ? (
                estChapitreVerrouille ? (
                  <div className="my-auto rounded-2xl border border-border bg-card p-10 text-center shadow-xs">
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
                ) : chargementPages ? (
                  <div className="flex flex-1 items-center justify-center py-16 text-center text-sm text-muted-foreground">
                    Chargement du contenu…
                  </div>
                ) : (
                  <article
                    key={
                      modePagesEditoriales
                        ? `${pageGauche?._id ?? ""}-${pageDroite?._id ?? ""}`
                        : chapitreTiptapCourant?._id
                    }
                    className={`animate-reader-page reader-book flex min-h-full flex-1 flex-col ${
                      modePagesEditoriales && doublePage ? "reader-book--open" : ""
                    }`}
                  >
                    {modePagesEditoriales ? (
                      <div className="reader-book__open">
                        {(() => {
                          const titresVus = new Set<string>();
                          const labelChapitre =
                            chapitreTiptapCourant?.titre?.trim() ||
                            `Chapitre ${chapitreTiptapCourant?.ordre ?? chapitreIndexActif + 1}`;
                          return (
                            <>
                              <section className="reader-book__folio reader-book__folio--left">
                                <header className="reader-book__running reader-book__running--left">
                                  {labelChapitre}
                                </header>
                                <ChapterJsonBody
                                  content={pageGauche?.contenu}
                                  taillePolice={taille}
                                  variant="book"
                                  className="reader-book__page"
                                  seenTitles={titresVus}
                                />
                              </section>
                              {pageDroite ? (
                                <section className="reader-book__folio reader-book__folio--right">
                                  <header className="reader-book__running reader-book__running--right">
                                    {livre.titre}
                                  </header>
                                  <ChapterJsonBody
                                    content={pageDroite.contenu}
                                    taillePolice={taille}
                                    variant="book"
                                    className="reader-book__page"
                                    seenTitles={titresVus}
                                  />
                                </section>
                              ) : doublePage ? (
                                <section
                                  className="reader-book__folio reader-book__folio--right reader-book__folio--blank"
                                  aria-hidden
                                />
                              ) : null}
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <>
                        <header className="reader-book__running reader-book__running--left">
                          {chapitreTiptapCourant?.titre?.trim() ||
                            `Chapitre ${chapitreTiptapCourant?.ordre ?? chapitreIndexActif + 1}`}
                        </header>
                        <ChapterJsonBody
                          content={contenuLecture}
                          taillePolice={taille}
                          variant="book"
                          className="reader-book__page"
                        />
                      </>
                    )}
                  </article>
                )
              ) : verrouilleLegacy ? (
                /* Cas 2 : Verrouillage aperçu gratuit */
                <div className="my-auto rounded-2xl border border-border bg-card p-10 text-center shadow-xs">
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
                /* Cas 3 : Texte paginé fluide (legacy) — double page sur desktop */
                <article
                  key={`${page}-${doublePage ? page + 1 : "solo"}`}
                  className={`animate-reader-page reader-book no-select flex min-h-full flex-1 flex-col ${
                    doublePage ? "reader-book--open" : ""
                  }`}
                  style={{ fontSize: `${taille}px` }}
                  onCopy={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div className={doublePage ? "reader-book__open" : undefined}>
                    <section
                      className={
                        doublePage
                          ? "reader-book__folio reader-book__folio--left"
                          : undefined
                      }
                    >
                      <header className="reader-book__running reader-book__running--left">
                        {chapitreCourantLegacy?.titre || `Chapitre`}
                      </header>
                      <div className="reader-book__page flex-1">
                        {paragraphes.map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </section>
                    {doublePage && page < livre.pages ? (
                      <section className="reader-book__folio reader-book__folio--right">
                        <header className="reader-book__running reader-book__running--right">
                          {livre.titre}
                        </header>
                        <div className="reader-book__page flex-1">
                          {paragraphesDroite.map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>

        {/* Barre inférieure de navigation */}
        <footer className="sticky bottom-0 shrink-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-none items-center gap-3 px-1 sm:px-4">
            {modeChapitresTiptap ? (
              <>
                <button
                  onClick={allerPrecedentTiptap}
                  disabled={debutNavigationTiptap}
                  className="grid size-9 place-items-center rounded-full border border-border disabled:opacity-30 hover:bg-secondary"
                  aria-label={modePagesEditoriales ? "Feuillet précédent" : "Chapitre précédent"}
                >
                  <ChevronLeft className="size-4" />
                </button>

                <div className="flex-1 text-center">
                  <p className="text-xs font-semibold text-foreground">
                    {modePagesEditoriales
                      ? labelPagesEditoriales
                      : `Chapitre ${chapitreIndexActif + 1} sur ${dynamicChapitres.length}`}
                  </p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {modePagesEditoriales
                      ? `Chapitre ${chapitreIndexActif + 1}/${dynamicChapitres.length}`
                      : null}
                    {modePagesEditoriales ? " · " : ""}
                    {accesComplet ? "Accès complet" : "Aperçu lecteur"}
                  </p>
                </div>

                <button
                  onClick={allerSuivantTiptap}
                  disabled={finNavigationTiptap}
                  className="grid size-9 place-items-center rounded-full border border-border disabled:opacity-30 hover:bg-secondary"
                  aria-label={modePagesEditoriales ? "Feuillet suivant" : "Chapitre suivant"}
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => allerPage(page - (doublePage ? 2 : 1))}
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
                    {doublePage && page < livre.pages
                      ? `Pages ${page}–${page + 1} / ${livre.pages}`
                      : `Page ${page} / ${livre.pages}`}{" "}
                    · {Math.round((page / livre.pages) * 100)} %
                    {accesComplet ? " · accès complet" : " · aperçu gratuit"}
                  </p>
                </div>

                <button
                  onClick={() => allerPage(page + (doublePage ? 2 : 1))}
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
