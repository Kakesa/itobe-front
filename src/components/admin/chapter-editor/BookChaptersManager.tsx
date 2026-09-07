import { useEffect, useState, useMemo } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  FileText,
  History,
  Lock,
  Plus,
  Trash2,
  Unlock,
  Sparkles,
} from "lucide-react";
import { ChapitresApi, PagesApi } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { useChapterAutosave } from "@/hooks/use-chapter-autosave";
import { ChapterRichEditor } from "./ChapterRichEditor";
import { ChapterConflictDialog } from "./ChapterConflictDialog";
import { ChapterVersionDrawer } from "./ChapterVersionDrawer";
import { ChapterPagesManager, type PageItem } from "./ChapterPagesManager";
import { PageRichEditor } from "./PageRichEditor";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface ChapterItem {
  _id: string;
  titre: string;
  slug?: string;
  ordre: number;
  statut: "Brouillon" | "En revue" | "Publié" | "Archivé";
  gratuit: boolean;
  /** @deprecated LEGACY — plage numérique, ne plus utiliser pour les Pages éditoriales */
  pages?: number[];
  revision: number;
  tempsLecture?: string;
  motsCount?: number;
  contenu?: any;
  updatedAt?: string;
}

interface BookChaptersManagerProps {
  livre: {
    id: string;
    slug: string;
    titre: string;
    auteur?: any;
    couverture?: string;
  };
  onRetour: () => void;
}

type VuePrincipale = "chapitre" | "pages" | "page" | "succes-chapitre";

export function BookChaptersManager({ livre, onRetour }: BookChaptersManagerProps) {
  const [chapitres, setChapitres] = useState<ChapterItem[]>([]);
  const [chargement, setChargement] = useState(true);
  const [chapitreActifId, setChapitreActifId] = useState<string | null>(null);
  const [tiroirVersionsOuvert, setTiroirVersionsOuvert] = useState(false);
  const [chapitreASupprimer, setChapitreASupprimer] = useState<ChapterItem | null>(null);
  const [vue, setVue] = useState<VuePrincipale>("chapitre");
  const [chapitreRecemmentCree, setChapitreRecemmentCree] = useState<ChapterItem | null>(null);
  const [pageActiveId, setPageActiveId] = useState<string | null>(null);
  /** Nombre de pages éditoriales par chapitre (source de vérité = collection Page). */
  const [compteursPages, setCompteursPages] = useState<Record<string, number>>({});

  const chargerCompteursPages = async (liste: ChapterItem[]) => {
    const entrees = await Promise.all(
      liste.map(async (chap) => {
        try {
          const res = await PagesApi.getByChapitre(chap._id);
          const pages = res?.data ?? res ?? [];
          return [chap._id, Array.isArray(pages) ? pages.length : 0] as const;
        } catch {
          return [chap._id, 0] as const;
        }
      }),
    );
    setCompteursPages(Object.fromEntries(entrees));
  };

  const chargerChapitres = async () => {
    setChargement(true);
    try {
      const res = await ChapitresApi.getByLivre(livre.id || livre.slug);
      const liste: ChapterItem[] = res?.data ?? res ?? [];
      setChapitres(liste);
      if (liste.length > 0 && !chapitreActifId) {
        setChapitreActifId(liste[0]._id);
      }
      void chargerCompteursPages(liste);
    } catch (error: any) {
      notify.erreur(error?.message || "Impossible de charger les chapitres");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    void chargerChapitres();
  }, [livre.id, livre.slug]);

  const chapitreCourant = useMemo(() => {
    return chapitres.find((c) => c._id === chapitreActifId) || null;
  }, [chapitres, chapitreActifId]);

  const creerNouveauChapitre = async () => {
    try {
      const nouveauNumero = chapitres.length + 1;
      const res = await ChapitresApi.create(livre.id || livre.slug, {
        titre: `Chapitre ${nouveauNumero}`,
        statut: "Brouillon",
        gratuit: nouveauNumero <= 2,
        contenu: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "" }],
            },
          ],
        },
      });

      const cree = res?.data ?? res;
      setChapitres((prev) => [...prev, cree]);
      setChapitreActifId(cree._id);
      setCompteursPages((prev) => ({ ...prev, [cree._id]: 0 }));
      setChapitreRecemmentCree(cree);
      setVue("succes-chapitre");
      notify.succes("Chapitre créé avec succès");
    } catch (error: any) {
      notify.erreur(error?.message || "Impossible de créer le chapitre");
    }
  };

  const ouvrirGestionPages = (chapitreId?: string) => {
    if (chapitreId) setChapitreActifId(chapitreId);
    setChapitreRecemmentCree(null);
    setPageActiveId(null);
    setVue("pages");
  };

  const ouvrirEditeurPage = (page: PageItem) => {
    setPageActiveId(page._id);
    setVue("page");
  };

  const deplacerChapitre = async (index: number, direction: "up" | "down") => {
    const cibleIndex = direction === "up" ? index - 1 : index + 1;
    if (cibleIndex < 0 || cibleIndex >= chapitres.length) return;

    const copie = [...chapitres];
    const [element] = copie.splice(index, 1);
    copie.splice(cibleIndex, 0, element);

    const ordonnes = copie.map((c, i) => ({ ...c, ordre: i + 1 }));
    setChapitres(ordonnes);

    try {
      await ChapitresApi.reorder(
        livre.id || livre.slug,
        ordonnes.map((c) => ({ id: c._id, ordre: c.ordre })),
      );
    } catch (error: any) {
      notify.erreur(error?.message || "Erreur lors de la réorganisation");
      void chargerChapitres();
    }
  };

  const executerSuppression = async () => {
    if (!chapitreASupprimer) return;
    try {
      await ChapitresApi.delete(chapitreASupprimer._id);
      notify.supprime("Chapitre", chapitreASupprimer.titre);
      const restantes = chapitres.filter((c) => c._id !== chapitreASupprimer._id);
      setChapitres(restantes);
      setCompteursPages((prev) => {
        const next = { ...prev };
        delete next[chapitreASupprimer._id];
        return next;
      });
      if (chapitreActifId === chapitreASupprimer._id) {
        setChapitreActifId(restantes[0]?._id || null);
        setVue("chapitre");
      }
      setChapitreASupprimer(null);
    } catch (error: any) {
      notify.erreur(error?.message || "Impossible de supprimer le chapitre");
    }
  };

  const handleEditerPage = (page: PageItem) => {
    ouvrirEditeurPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRetour}
            className="grid size-9 place-items-center rounded-lg border border-border hover:bg-secondary text-muted-foreground transition"
            title="Retour à la liste des livres"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Édition numérique
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-xs text-muted-foreground">Livre → Chapitre → Page</span>
            </div>
            <h2 className="font-display text-2xl text-foreground">{livre.titre}</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={creerNouveauChapitre}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition"
        >
          <Plus className="size-4" /> Ajouter un chapitre
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sommaire ({chapitres.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {chapitres.map((chap, idx) => {
              const actif = chap._id === chapitreActifId;
              const nbPages = compteursPages[chap._id];
              return (
                <div
                  key={chap._id}
                  onClick={() => {
                    setChapitreActifId(chap._id);
                    setVue("chapitre");
                    setChapitreRecemmentCree(null);
                  }}
                  className={`group relative flex items-center justify-between gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                    actif
                      ? "border-accent bg-accent/10 shadow-xs"
                      : "border-border bg-card hover:border-accent/40 hover:bg-secondary/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[0.7rem] font-bold text-muted-foreground">
                        #{chap.ordre}
                      </span>
                      <h4 className="truncate text-sm font-semibold text-foreground">
                        {chap.titre}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded text-[0.65rem] font-medium ${
                          chap.statut === "Publié"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {chap.statut}
                      </span>

                      {chap.gratuit ? (
                        <span className="inline-flex items-center gap-0.5 text-accent font-medium">
                          <Unlock className="size-3" /> Gratuit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                          <Lock className="size-3" /> Payant
                        </span>
                      )}

                      <span>·</span>
                      <span>v{chap.revision}</span>
                      {typeof nbPages === "number" && (
                        <>
                          <span>·</span>
                          <span>
                            {nbPages} page{nbPages !== 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        void deplacerChapitre(idx, "up");
                      }}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-20"
                      title="Monter"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === chapitres.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        void deplacerChapitre(idx, "down");
                      }}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-20"
                      title="Descendre"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChapitreASupprimer(chap);
                      }}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {chapitres.length === 0 && !chargement && (
              <div className="p-8 text-center border border-dashed border-border rounded-xl bg-card">
                <FileText className="size-8 mx-auto text-muted-foreground stroke-1 mb-2" />
                <p className="text-sm font-medium">Aucun chapitre créé</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Créez le premier chapitre pour commencer la rédaction.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          {vue === "succes-chapitre" && chapitreRecemmentCree ? (
            <div className="rounded-2xl border border-accent/30 bg-card p-8 text-center space-y-4 shadow-xs">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-accent/15 text-accent">
                <BookOpen className="size-7" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-foreground">Chapitre créé avec succès</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Votre chapitre « {chapitreRecemmentCree.titre} » est prêt. Commencez maintenant à
                  créer ses pages.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => ouvrirGestionPages(chapitreRecemmentCree._id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition"
                >
                  <FileText className="size-4" />
                  Créer les pages
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChapitreRecemmentCree(null);
                    setVue("chapitre");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary transition"
                >
                  Retour aux chapitres
                </button>
              </div>
            </div>
          ) : chapitreCourant && vue === "page" && pageActiveId ? (
            <PageRichEditor
              key={pageActiveId}
              pageId={pageActiveId}
              chapitreId={chapitreCourant._id}
              chapitreTitre={chapitreCourant.titre}
              onRetour={() => {
                setPageActiveId(null);
                setVue("pages");
                void chargerCompteursPages(chapitres);
              }}
              onChangerPage={(id) => setPageActiveId(id)}
              onPageMiseAJour={() => {
                void chargerCompteursPages(chapitres);
              }}
            />
          ) : chapitreCourant && vue === "pages" ? (
            <ChapterPagesManager
              key={chapitreCourant._id}
              chapitreId={chapitreCourant._id}
              chapitreTitre={chapitreCourant.titre}
              onRetour={() => {
                setVue("chapitre");
                void chargerCompteursPages(chapitres);
              }}
              onEditerPage={handleEditerPage}
            />
          ) : chapitreCourant ? (
            <ChapterEditorPanel
              key={chapitreCourant._id}
              chapitre={chapitreCourant}
              livreIdOrSlug={livre.id || livre.slug}
              nbPagesEditoriales={compteursPages[chapitreCourant._id] ?? 0}
              onChapitreMisAJour={(maj) => {
                setChapitres((prev) =>
                  prev.map((c) => (c._id === maj._id ? { ...c, ...maj } : c)),
                );
              }}
              onOuvrirVersions={() => setTiroirVersionsOuvert(true)}
              onGererPages={() => ouvrirGestionPages(chapitreCourant._id)}
            />
          ) : (
            <div className="p-12 text-center rounded-2xl border border-border bg-card">
              <BookOpen className="size-10 mx-auto text-muted-foreground stroke-1 mb-3" />
              <h3 className="font-display text-lg">Sélectionnez un chapitre</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choisissez un chapitre dans le sommaire à gauche pour gérer ses pages et son
                contenu.
              </p>
            </div>
          )}
        </div>
      </div>

      {chapitreCourant && (
        <ChapterVersionDrawer
          ouvert={tiroirVersionsOuvert}
          onFermer={() => setTiroirVersionsOuvert(false)}
          chapterId={chapitreCourant._id}
          onVersionRestauree={(restaure) => {
            setChapitres((prev) =>
              prev.map((c) => (c._id === restaure._id ? { ...c, ...restaure } : c)),
            );
          }}
        />
      )}

      <ConfirmDialog
        ouvert={!!chapitreASupprimer}
        titre="Supprimer le chapitre ?"
        message={
          chapitreASupprimer
            ? `« ${chapitreASupprimer.titre} », ses pages éditoriales et tout son historique seront définitivement supprimés.`
            : ""
        }
        onAnnuler={() => setChapitreASupprimer(null)}
        onConfirmer={executerSuppression}
      />
    </div>
  );
}

function ChapterEditorPanel({
  chapitre,
  livreIdOrSlug,
  nbPagesEditoriales,
  onChapitreMisAJour,
  onOuvrirVersions,
  onGererPages,
}: {
  chapitre: ChapterItem;
  livreIdOrSlug: string;
  nbPagesEditoriales: number;
  onChapitreMisAJour: (maj: ChapterItem) => void;
  onOuvrirVersions: () => void;
  onGererPages: () => void;
}) {
  const [titre, setTitre] = useState(chapitre.titre);
  const [statut, setStatut] = useState(chapitre.statut);
  const [gratuit, setGratuit] = useState(chapitre.gratuit);
  const [modalConflit, setModalConflit] = useState(false);

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
  } = useChapterAutosave({
    chapterId: chapitre._id,
    livreIdOrSlug,
    initialRevision: chapitre.revision,
    initialTitle: chapitre.titre,
    initialContent: chapitre.contenu || { type: "doc", content: [] },
    initialStatut: chapitre.statut,
    initialGratuit: chapitre.gratuit,
    updatedAt: chapitre.updatedAt,
    onSaveSuccess: onChapitreMisAJour,
  });

  const handleTitreChange = (nouveauTitre: string) => {
    setTitre(nouveauTitre);
    notifyChange(nouveauTitre, chapitre.contenu, statut, gratuit);
  };

  const handleStatutChange = (nouveauStatut: ChapterItem["statut"]) => {
    setStatut(nouveauStatut);
    notifyChange(titre, chapitre.contenu, nouveauStatut, gratuit);
  };

  const handleGratuitChange = (nouveauGratuit: boolean) => {
    setGratuit(nouveauGratuit);
    notifyChange(titre, chapitre.contenu, statut, nouveauGratuit);
  };

  const handleContenuChange = (nouveauJson: any) => {
    notifyChange(titre, nouveauJson, statut, gratuit);
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
              onClick={applyLocalDraft}
              className="text-xs font-semibold px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
            >
              Restaurer
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-accent/25 bg-accent/5 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Pages éditoriales
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {nbPagesEditoriales > 0
              ? `${nbPagesEditoriales} page${nbPagesEditoriales > 1 ? "s" : ""} — source de vérité du contenu.`
              : "Aucune page encore. Créez les pages de ce chapitre pour y rédiger le contenu."}
          </p>
        </div>
        <button
          type="button"
          onClick={onGererPages}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition"
        >
          <FileText className="size-4" />
          {nbPagesEditoriales > 0 ? "Gérer les pages" : "Créer les pages"}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Métadonnées du chapitre
          </p>
          <input
            type="text"
            value={titre}
            onChange={(e) => handleTitreChange(e.target.value)}
            className="w-full max-w-xl bg-transparent font-display text-lg outline-none border-b border-transparent focus:border-accent"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statut}
            onChange={(e) => handleStatutChange(e.target.value as ChapterItem["statut"])}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium"
          >
            <option value="Brouillon">Brouillon</option>
            <option value="En revue">En revue</option>
            <option value="Publié">Publié</option>
            <option value="Archivé">Archivé</option>
          </select>
          <button
            type="button"
            onClick={() => handleGratuitChange(!gratuit)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              gratuit
                ? "border-accent/30 bg-accent/15 text-accent"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            {gratuit ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />}
            {gratuit ? "Gratuit" : "Payant"}
          </button>
          <button
            type="button"
            onClick={onOuvrirVersions}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary transition"
          >
            <History className="size-3.5" /> v{chapitre.revision}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-card/60 p-3">
        <p className="text-[0.7rem] uppercase font-semibold text-muted-foreground mb-2">
          Contenu chapitre (legacy — transition)
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Conservé temporairement pour compatibilité. Le contenu éditorial cible vit dans{" "}
          <strong>Page.contenu</strong>.
        </p>
        <ChapterRichEditor
          initialContent={chapitre.contenu}
          onChange={handleContenuChange}
          status={status}
          lastSavedAt={lastSavedAt}
          errorMessage={errorMessage}
          onSaveNow={saveNow}
          onOpenConflictModal={() => setModalConflit(true)}
        />
      </div>

      <ChapterConflictDialog
        ouvert={modalConflit || status === "conflict"}
        onFermer={() => setModalConflit(false)}
        serverRevision={conflictDetails?.serverRevision}
        onRecharger={() => void resolveConflict("reload")}
        onForcerEcrasement={() => void resolveConflict("force_overwrite")}
      />
    </div>
  );
}
