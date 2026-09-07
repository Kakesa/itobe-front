import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { PagesApi } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { usePageAutosave } from "@/hooks/use-page-autosave";
import { ChapterRichEditor } from "./ChapterRichEditor";
import { ChapterConflictDialog } from "./ChapterConflictDialog";
import type { PageItem } from "./ChapterPagesManager";

interface PageRichEditorProps {
  pageId: string;
  chapitreTitre: string;
  onRetour: () => void;
  onPageMiseAJour?: (page: PageItem) => void;
}

/**
 * Éditeur de contenu d'une Page éditoriale (Tiptap) avec autosave.
 */
export function PageRichEditor({
  pageId,
  chapitreTitre,
  onRetour,
  onPageMiseAJour,
}: PageRichEditorProps) {
  const [chargement, setChargement] = useState(true);
  const [page, setPage] = useState<PageItem | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      setChargement(true);
      try {
        const res = await PagesApi.getById(pageId);
        const data: PageItem = res?.data ?? res;
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
  }, [pageId]);

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
      chapitreTitre={chapitreTitre}
      onRetour={onRetour}
      onPageMiseAJour={(maj) => {
        setPage((prev) => ({ ...(prev ?? maj), ...maj }));
        onPageMiseAJour?.(maj);
      }}
    />
  );
}

function PageRichEditorLoaded({
  page,
  chapitreTitre,
  onRetour,
  onPageMiseAJour,
}: {
  page: PageItem;
  chapitreTitre: string;
  onRetour: () => void;
  onPageMiseAJour?: (page: PageItem) => void;
}) {
  const [titre, setTitre] = useState(page.titre || `Page ${page.ordre}`);
  const [contenu, setContenu] = useState<any>(page.contenu || { type: "doc", content: [] });
  const [modalConflit, setModalConflit] = useState(false);
  const [revisionAffichee, setRevisionAffichee] = useState(page.revision ?? 1);

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
    },
  });

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

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={onRetour}
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
          Page {page.ordre} · v{revisionAffichee}
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
