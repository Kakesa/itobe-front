import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  FileText,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PagesApi } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export interface PageItem {
  _id: string;
  titre: string;
  ordre: number;
  revision: number;
  tempsLecture?: string;
  motsCount?: number;
  contenu?: unknown;
  updatedAt?: string;
  verrouille?: boolean;
}

interface ChapterPagesManagerProps {
  chapitreId: string;
  chapitreTitre: string;
  /** Retour au sommaire des chapitres / panneau chapitre */
  onRetour: () => void;
  /** Ouverture de l'éditeur d'une page (étape 4+) */
  onEditerPage?: (page: PageItem) => void;
}

export function ChapterPagesManager({
  chapitreId,
  chapitreTitre,
  onRetour,
  onEditerPage,
}: ChapterPagesManagerProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [chargement, setChargement] = useState(true);
  const [creationEnCours, setCreationEnCours] = useState(false);
  const [reordonnancement, setReordonnancement] = useState(false);
  const [pageASupprimer, setPageASupprimer] = useState<PageItem | null>(null);
  const [editionTitreId, setEditionTitreId] = useState<string | null>(null);
  const [titreBrouillon, setTitreBrouillon] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const pageIds = useMemo(() => pages.map((p) => p._id), [pages]);

  const chargerPages = useCallback(async () => {
    setChargement(true);
    try {
      const res = await PagesApi.getByChapitre(chapitreId);
      const liste: PageItem[] = res?.data ?? res ?? [];
      setPages(liste);
    } catch (error: any) {
      notify.erreur(error?.message || "Impossible de charger les pages");
    } finally {
      setChargement(false);
    }
  }, [chapitreId]);

  useEffect(() => {
    void chargerPages();
  }, [chargerPages]);

  const persisterOrdre = async (ordonnees: PageItem[]) => {
    setReordonnancement(true);
    try {
      await PagesApi.reorder(
        chapitreId,
        ordonnees.map((p) => ({ id: p._id, ordre: p.ordre })),
      );
    } catch (error: any) {
      notify.erreur(error?.message || "Erreur lors de la réorganisation");
      void chargerPages();
    } finally {
      setReordonnancement(false);
    }
  };

  const creerPage = async () => {
    setCreationEnCours(true);
    try {
      const res = await PagesApi.create(chapitreId, {
        titre: `Page ${pages.length + 1}`,
        contenu: {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
        },
      });
      const cree: PageItem = res?.data ?? res;
      setPages((prev) => [...prev, cree].sort((a, b) => a.ordre - b.ordre));
      notify.succes(`« ${cree.titre} » créée`);
      onEditerPage?.(cree);
    } catch (error: any) {
      notify.erreur(error?.message || "Impossible de créer la page");
    } finally {
      setCreationEnCours(false);
    }
  };

  const deplacerPage = async (index: number, direction: "up" | "down") => {
    const cibleIndex = direction === "up" ? index - 1 : index + 1;
    if (cibleIndex < 0 || cibleIndex >= pages.length) return;

    const ordonnees = arrayMove(pages, index, cibleIndex).map((p, i) => ({
      ...p,
      ordre: i + 1,
    }));
    setPages(ordonnees);
    await persisterOrdre(ordonnees);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pages.findIndex((p) => p._id === active.id);
    const newIndex = pages.findIndex((p) => p._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const ordonnees = arrayMove(pages, oldIndex, newIndex).map((p, i) => ({
      ...p,
      ordre: i + 1,
    }));
    setPages(ordonnees);
    await persisterOrdre(ordonnees);
  };

  const demarrerEditionTitre = (page: PageItem) => {
    setEditionTitreId(page._id);
    setTitreBrouillon(page.titre || `Page ${page.ordre}`);
  };

  const validerTitre = async (page: PageItem) => {
    const nouveau = titreBrouillon.trim();
    setEditionTitreId(null);
    if (!nouveau || nouveau === page.titre) return;

    try {
      const res = await PagesApi.update(page._id, {
        titre: nouveau,
        revision: page.revision,
      });
      const maj: PageItem = res?.data ?? res;
      setPages((prev) => prev.map((p) => (p._id === maj._id ? { ...p, ...maj } : p)));
      notify.succes("Titre de page mis à jour");
    } catch (error: any) {
      notify.erreur(error?.message || "Impossible de renommer la page");
      void chargerPages();
    }
  };

  const executerSuppression = async () => {
    if (!pageASupprimer) return;
    try {
      await PagesApi.delete(pageASupprimer._id);
      notify.supprime("Page", pageASupprimer.titre || `Page ${pageASupprimer.ordre}`);
      setPageASupprimer(null);
      await chargerPages();
    } catch (error: any) {
      notify.erreur(error?.message || "Impossible de supprimer la page");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={onRetour}
            className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-border hover:bg-secondary text-muted-foreground transition"
            title="Retour au chapitre"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Pages éditoriales
            </p>
            <h3 className="font-display text-xl text-foreground truncate">{chapitreTitre}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Glissez-déposez les pages pour les réordonner. Une page = une unité de contenu,
              pas une page PDF.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void creerPage()}
          disabled={creationEnCours}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition disabled:opacity-60"
        >
          {creationEnCours ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Ajouter une page
        </button>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sommaire des pages ({pages.length})
        </span>
        {reordonnancement && (
          <span className="inline-flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Enregistrement de l’ordre…
          </span>
        )}
      </div>

      {chargement ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Chargement des pages…
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <FileText className="mx-auto mb-3 size-9 text-muted-foreground stroke-1" />
          <p className="text-sm font-medium">Aucune page pour ce chapitre</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Créez la première page pour y rédiger le contenu Tiptap. Vous pourrez en ajouter
            d’autres et les réordonner ensuite.
          </p>
          <button
            type="button"
            onClick={() => void creerPage()}
            disabled={creationEnCours}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Plus className="size-4" /> Créer la page 1
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {pages.map((page, idx) => (
                <SortablePageRow
                  key={page._id}
                  page={page}
                  index={idx}
                  total={pages.length}
                  enEdition={editionTitreId === page._id}
                  titreBrouillon={titreBrouillon}
                  onTitreBrouillonChange={setTitreBrouillon}
                  onValiderTitre={() => void validerTitre(page)}
                  onAnnulerEdition={() => setEditionTitreId(null)}
                  onDemarrerEdition={() => demarrerEditionTitre(page)}
                  onEditer={() => onEditerPage?.(page)}
                  onMonter={() => void deplacerPage(idx, "up")}
                  onDescendre={() => void deplacerPage(idx, "down")}
                  onSupprimer={() => setPageASupprimer(page)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        ouvert={!!pageASupprimer}
        titre="Supprimer la page ?"
        message={
          pageASupprimer
            ? `« ${pageASupprimer.titre || `Page ${pageASupprimer.ordre}`} » et son contenu seront définitivement supprimés.`
            : ""
        }
        onAnnuler={() => setPageASupprimer(null)}
        onConfirmer={() => void executerSuppression()}
      />
    </div>
  );
}

function SortablePageRow({
  page,
  index,
  total,
  enEdition,
  titreBrouillon,
  onTitreBrouillonChange,
  onValiderTitre,
  onAnnulerEdition,
  onDemarrerEdition,
  onEditer,
  onMonter,
  onDescendre,
  onSupprimer,
}: {
  page: PageItem;
  index: number;
  total: number;
  enEdition: boolean;
  titreBrouillon: string;
  onTitreBrouillonChange: (v: string) => void;
  onValiderTitre: () => void;
  onAnnulerEdition: () => void;
  onDemarrerEdition: () => void;
  onEditer: () => void;
  onMonter: () => void;
  onDescendre: () => void;
  onSupprimer: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between gap-3 rounded-xl border bg-card p-3 transition ${
        isDragging
          ? "border-accent shadow-md z-10 relative opacity-95"
          : "border-border hover:border-accent/40"
      }`}
    >
      <div className="min-w-0 flex-1 flex items-center gap-2">
        <button
          type="button"
          className="grid size-8 shrink-0 cursor-grab place-items-center rounded-lg text-muted-foreground hover:bg-secondary active:cursor-grabbing touch-none"
          title="Glisser pour réordonner"
          aria-label="Glisser pour réordonner"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
          {page.ordre}
        </span>

        <div className="min-w-0 flex-1">
          {enEdition ? (
            <input
              autoFocus
              type="text"
              value={titreBrouillon}
              onChange={(e) => onTitreBrouillonChange(e.target.value)}
              onBlur={onValiderTitre}
              onKeyDown={(e) => {
                if (e.key === "Enter") onValiderTitre();
                if (e.key === "Escape") onAnnulerEdition();
              }}
              className="w-full rounded-md border border-accent bg-background px-2 py-1 text-sm font-semibold outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={onEditer}
              className="block w-full text-left truncate text-sm font-semibold text-foreground hover:text-accent transition"
              title="Ouvrir l’éditeur"
            >
              {page.titre || `Page ${page.ordre}`}
            </button>
          )}
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
            v{page.revision}
            {typeof page.motsCount === "number" ? ` · ${page.motsCount} mots` : ""}
            {page.tempsLecture ? ` · ${page.tempsLecture}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onDemarrerEdition}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
          title="Renommer"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={index === 0}
          onClick={onMonter}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground disabled:opacity-20"
          title="Monter"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={onDescendre}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground disabled:opacity-20"
          title="Descendre"
        >
          <ArrowDown className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onSupprimer}
          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
          title="Supprimer"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
