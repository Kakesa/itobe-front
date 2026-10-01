import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  List,
  Sparkles,
} from "lucide-react";
import { PagesApi } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { usePageAutosave } from "@/hooks/use-page-autosave";
import { ChapterRichEditor } from "./ChapterRichEditor";
import { ChapterConflictDialog } from "./ChapterConflictDialog";
import type { PageItem } from "./ChapterPagesManager";

interface PageRichEditorProps {
  pageId: string;
  chapitreId: string;
  chapitreTitre: string;
  onRetour: () => void;
  /** Navigation vers une autre page du même chapitre */
  onChangerPage: (pageId: string) => void;
  onPageMiseAJour?: (page: PageItem) => void;
}

/**
 * Éditeur de contenu d'une Page éditoriale (Tiptap) avec autosave
 * et navigation Page précédente / Liste / Page suivante.
 */
export function PageRichEditor({
  pageId,
  chapitreId,
  chapitreTitre,
  onRetour,
  onChangerPage,
  onPageMiseAJour,
}: PageRichEditorProps) {
  const [chargement, setChargement] = useState(true);
  const [page, setPage] = useState<PageItem | null>(null);
  const [pagesDuChapitre, setPagesDuChapitre] = useState<PageItem[]>([]);

  const chargerSommairePages = useCallback(async () => {
    try {
      const res = await PagesApi.getByChapitre(chapitreId);
      const liste: PageItem[] = res?.data ?? res ?? [];
      setPagesDuChapitre(liste);
    } catch {
      // Le sommaire est secondaire : l'édition reste possible
    }
  }, [chapitreId]);

  useEffect(() => {
    let annule = false;
    (async () => {
      setChargement(true);
      try {
        const [pageRes] = await Promise.all([
          PagesApi.getById(pageId),
          chargerSommairePages(),
        ]);
        const data: PageItem = pageRes?.data ?? pageRes;
        if (!annule) setPage(data);
      } catch (error: any) {
        if (!annule) {
          notify.erreur(error?.message || "Impossible de charger la page");
          onRetour();
        }
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, chapitreId, chargerSommairePages]);

  if (chargement || !page) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Chargement de la page…
      </div>
    );
  }

  return (
    <PageRichEditorLoaded
      key={page._id}
      page={page}
      pagesDuChapitre={pagesDuChapitre}
      chapitreTitre={chapitreTitre}
      onRetour={onRetour}
      onChangerPage={onChangerPage}
      onPageMiseAJour={(maj) => {
        setPage((prev) => ({ ...(prev ?? maj), ...maj }));
        onPageMiseAJour?.(maj);
      }}
      onPagesMisesAJour={setPagesDuChapitre}
    />
  );
}

function PageRichEditorLoaded({
  page,
  pagesDuChapitre,
  chapitreTitre,
  onRetour,
  onChangerPage,
  onPageMiseAJour,
  onPagesMisesAJour,
}: {
  page: PageItem;
  pagesDuChapitre: PageItem[];
  chapitreTitre: string;
  onRetour: () => void;
  onChangerPage: (pageId: string) => void;
  onPageMiseAJour?: (page: PageItem) => void;
  onPagesMisesAJour: (pages: PageItem[]) => void;
}) {
  const [titre, setTitre] = useState(page.titre || `Page ${page.ordre}`);
  const [contenu, setContenu] = useState<any>(page.contenu || { type: "doc", content: [] });
  const [modalConflit, setModalConflit] = useState(false);
  const [revisionAffichee, setRevisionAffichee] = useState(page.revision ?? 1);
  const [menuPagesOuvert, setMenuPagesOuvert] = useState(false);
  const [navigationEnCours, setNavigationEnCours] = useState(false);

  const {
    status,
    lastSavedAt,
    errorMessage,
    localDraft,
    conflictDetails,
    notifyChange,
    saveNow,
    applyLocalDraft,
    discardLocalDraft,
    resolveConflict,
  } = usePageAutosave({
    pageId: page._id,
    initialRevision: page.revision ?? 1,
    initialTitle: page.titre || `Page ${page.ordre}`,
    initialContent: page.contenu || { type: "doc", content: [] },
    updatedAt: page.updatedAt,
    onSaveSuccess: (maj) => {
      const pageMaj = maj as PageItem;
      setRevisionAffichee(pageMaj.revision ?? revisionAffichee + 1);
      if (pageMaj.titre !== undefined) setTitre(pageMaj.titre || `Page ${page.ordre}`);
      if (pageMaj.contenu !== undefined) setContenu(pageMaj.contenu);
      onPageMiseAJour?.(pageMaj);
      onPagesMisesAJour(
        pagesDuChapitre.map((p) => (p._id === pageMaj._id ? { ...p, ...pageMaj } : p)),
      );
    },
  });

  const indexCourant = useMemo(() => {
    const idx = pagesDuChapitre.findIndex((p) => p._id === page._id);
    return idx >= 0 ? idx : Math.max(0, (page.ordre || 1) - 1);
  }, [page._id, page.ordre, pagesDuChapitre]);

  const pagePrecedente = indexCourant > 0 ? pagesDuChapitre[indexCourant - 1] : null;
  const pageSuivante =
    indexCourant >= 0 && indexCourant < pagesDuChapitre.length - 1
      ? pagesDuChapitre[indexCourant + 1]
      : null;

  const totalPages = pagesDuChapitre.length || 1;
  const numeroAffiche = pagesDuChapitre.length > 0 ? indexCourant + 1 : page.ordre;

  const naviguerVers = async (cibleId: string | null | undefined) => {
    if (!cibleId || cibleId === page._id || navigationEnCours) return;
    setNavigationEnCours(true);
    setMenuPagesOuvert(false);
    try {
      await saveNow();
      onChangerPage(cibleId);
    } finally {
      setNavigationEnCours(false);
    }
  };

  const retourListe = async () => {
    if (navigationEnCours) return;
    setNavigationEnCours(true);
    try {
      await saveNow();
      onRetour();
    } finally {
      setNavigationEnCours(false);
    }
  };

  const handleTitreChange = (nouveauTitre: string) => {
    setTitre(nouveauTitre);
    notifyChange(nouveauTitre, contenu);
  };

  const handleContenuChange = (json: any) => {
    setContenu(json);
    notifyChange(titre, json);
  };

  const handleApplyDraft = () => {
    const restored = applyLocalDraft();
    if (restored) {
      setTitre(restored.titre);
      setContenu(restored.contenu);
    }
  };

  const handleResolveReload = async () => {
    const serverPage = await resolveConflict("reload");
    if (serverPage) {
      setTitre(serverPage.titre || `Page ${serverPage.ordre}`);
      setContenu(serverPage.contenu || { type: "doc", content: [] });
      setRevisionAffichee(serverPage.revision ?? 1);
    }
    setModalConflit(false);
  };

  return (
    <div className="space-y-4">
      {localDraft && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5 text-xs">
            <Sparkles className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Un brouillon local plus récent a été récupéré après rechargement.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={discardLocalDraft}
              className="text-xs px-2.5 py-1 rounded hover:bg-amber-500/20"
            >
              Ignorer
            </button>
            <button
              type="button"
              onClick={handleApplyDraft}
              className="text-xs font-semibold px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
            >
              Restaurer
            </button>
          </div>
        </div>
      )}

      {/* Navigation pages */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-2.5">
        <button
          type="button"
          disabled={!pagePrecedente || navigationEnCours}
          onClick={() => void naviguerVers(pagePrecedente?._id)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary transition disabled:opacity-35 disabled:pointer-events-none"
        >
          <ChevronLeft className="size-4" />
          Page précédente
        </button>

        <div className="relative">
          <button
            type="button"
            disabled={navigationEnCours}
            onClick={() => setMenuPagesOuvert((o) => !o)}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary/80 px-3 py-2 text-xs font-semibold hover:bg-secondary transition"
          >
            <List className="size-3.5" />
            Liste des pages
            <span className="font-normal text-muted-foreground">
              ({numeroAffiche}/{totalPages})
            </span>
          </button>

          {menuPagesOuvert && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Fermer le menu"
                onClick={() => setMenuPagesOuvert(false)}
              />
              <div className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-xl border border-border bg-card p-2 shadow-lg">
                <button
                  type="button"
                  onClick={() => void retourListe()}
                  className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-accent hover:bg-accent/10"
                >
                  <ArrowLeft className="size-3.5" />
                  Retour au gestionnaire
                </button>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {pagesDuChapitre.map((p) => {
                    const active = p._id === page._id;
                    return (
                      <button
                        key={p._id}
                        type="button"
                        disabled={active || navigationEnCours}
                        onClick={() => void naviguerVers(p._id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary text-foreground"
                        }`}
                      >
                        <span className="font-bold opacity-70">#{p.ordre}</span>
                        <span className="truncate">{p.titre || `Page ${p.ordre}`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={!pageSuivante || navigationEnCours}
          onClick={() => void naviguerVers(pageSuivante?._id)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary transition disabled:opacity-35 disabled:pointer-events-none"
        >
          Page suivante
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={() => void retourListe()}
            className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-border hover:bg-secondary text-muted-foreground transition"
            title="Retour aux pages"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent inline-flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Édition de page
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{chapitreTitre}</p>
            <input
              type="text"
              value={titre}
              onChange={(e) => handleTitreChange(e.target.value)}
              className="mt-1 w-full max-w-xl bg-transparent font-display text-xl outline-none border-b border-transparent focus:border-accent"
              placeholder={`Page ${page.ordre}`}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Page {numeroAffiche}/{totalPages} · v{revisionAffichee}
          {status === "saving" ? " · autosave…" : null}
        </div>
      </div>

      <ChapterRichEditor
        key={page._id}
        initialContent={contenu}
        onChange={handleContenuChange}
        status={status}
        lastSavedAt={lastSavedAt}
        errorMessage={errorMessage}
        onSaveNow={() => void saveNow()}
        onOpenConflictModal={() => setModalConflit(true)}
        placeholder="Rédigez le contenu de cette page… Texte, images, citations…"
        editeurImagePage
      />

      <ChapterConflictDialog
        ouvert={modalConflit || status === "conflict"}
        onFermer={() => setModalConflit(false)}
        serverRevision={conflictDetails?.serverRevision}
        onRecharger={() => void handleResolveReload()}
        onForcerEcrasement={() => {
          setModalConflit(false);
          void resolveConflict("force_overwrite");
        }}
      />
    </div>
  );
}
