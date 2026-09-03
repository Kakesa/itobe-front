import { useEffect, useState } from "react";
import { Clock, History, Loader2, Plus, RotateCcw, X } from "lucide-react";
import { ChapitresApi } from "@/lib/api-client";
import { notify } from "@/lib/notify";

interface VersionItem {
  _id: string;
  revision: number;
  titre: string;
  description?: string;
  createdAt: string;
  creePar?: {
    nom?: string;
    prenom?: string;
    email?: string;
  };
}

interface ChapterVersionDrawerProps {
  ouvert: boolean;
  onFermer: () => void;
  chapterId: string;
  onVersionRestauree: (chapitreRestaure: any) => void;
}

export function ChapterVersionDrawer({
  ouvert,
  onFermer,
  chapterId,
  onVersionRestauree,
}: ChapterVersionDrawerProps) {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [chargement, setChargement] = useState(false);
  const [creationOuverte, setCreationOuverte] = useState(false);
  const [descriptionSnapshot, setDescriptionSnapshot] = useState("");
  const [enCreation, setEnCreation] = useState(false);
  const [versionARestaurer, setVersionARestaurer] = useState<VersionItem | null>(null);
  const [enRestauration, setEnRestauration] = useState(false);

  const chargerVersions = async () => {
    if (!chapterId) return;
    setChargement(true);
    try {
      const res = await ChapitresApi.getVersions(chapterId);
      setVersions(res?.data ?? res ?? []);
    } catch (error: any) {
      notify.erreur(error?.message || "Impossible de charger l'historique des versions");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    if (ouvert) {
      void chargerVersions();
    }
  }, [ouvert, chapterId]);

  const creerSnapshot = async () => {
    if (!descriptionSnapshot.trim()) return;
    setEnCreation(true);
    try {
      await ChapitresApi.createVersion(chapterId, { description: descriptionSnapshot.trim() });
      notify.succes("Point de sauvegarde créé");
      setDescriptionSnapshot("");
      setCreationOuverte(false);
      await chargerVersions();
    } catch (error: any) {
      notify.erreur(error?.message || "Erreur lors de la création du point de sauvegarde");
    } finally {
      setEnCreation(false);
    }
  };

  const executerRestauration = async () => {
    if (!versionARestaurer) return;
    setEnRestauration(true);
    try {
      const res = await ChapitresApi.restoreVersion(chapterId, versionARestaurer._id);
      const updated = res?.data ?? res;
      notify.succes(`Version v${versionARestaurer.revision} restaurée avec succès`);
      onVersionRestauree(updated);
      setVersionARestaurer(null);
      onFermer();
    } catch (error: any) {
      notify.erreur(error?.message || "Impossible de restaurer cette version");
    } finally {
      setEnRestauration(false);
    }
  };

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="size-5 text-accent" />
            <h3 className="font-display text-lg">Historique des versions</h3>
          </div>
          <button
            type="button"
            onClick={onFermer}
            className="grid size-8 place-items-center rounded-full hover:bg-secondary text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Action création snapshot */}
        <div className="p-4 border-b border-border bg-muted/20">
          {!creationOuverte ? (
            <button
              type="button"
              onClick={() => setCreationOuverte(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary py-2 px-3 text-xs font-medium transition"
            >
              <Plus className="size-4" /> Créer un point de sauvegarde
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={descriptionSnapshot}
                onChange={(e) => setDescriptionSnapshot(e.target.value)}
                placeholder="Ex: Avant relecture finale, v1.2..."
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:border-accent outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreationOuverte(false);
                    setDescriptionSnapshot("");
                  }}
                  className="rounded px-2.5 py-1 text-xs text-muted-foreground hover:bg-secondary"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!descriptionSnapshot.trim() || enCreation}
                  onClick={creerSnapshot}
                  className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {enCreation && <Loader2 className="size-3 animate-spin" />} Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des versions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chargement ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <p className="text-xs">Chargement de l'historique…</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <Clock className="size-8 mx-auto stroke-1" />
              <p className="text-sm font-medium">Aucun point de sauvegarde</p>
              <p className="text-xs max-w-xs mx-auto">
                Créez un point de sauvegarde pour conserver une version restaurable de ce chapitre.
              </p>
            </div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver._id}
                className="rounded-xl border border-border bg-background p-3.5 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-semibold bg-accent/15 text-accent">
                    Révision v{ver.revision}
                  </span>
                  <span className="text-[0.7rem] text-muted-foreground">
                    {new Date(ver.createdAt).toLocaleString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-xs font-medium text-foreground">
                  {ver.description || "Point de sauvegarde"}
                </p>

                {ver.creePar?.nom && (
                  <p className="text-[0.7rem] text-muted-foreground">
                    Par {ver.creePar.prenom ? `${ver.creePar.prenom} ` : ""}
                    {ver.creePar.nom}
                  </p>
                )}

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setVersionARestaurer(ver)}
                    className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium hover:underline"
                  >
                    <RotateCcw className="size-3" /> Restaurer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de confirmation de restauration */}
        {versionARestaurer && (
          <div className="p-4 border-t border-border bg-muted/40 space-y-3">
            <p className="text-xs text-foreground font-medium">
              Confirmer la restauration de la version v{versionARestaurer.revision} ?
            </p>
            <p className="text-[0.75rem] text-muted-foreground">
              Une sauvegarde de l'état actuel sera automatiquement créée avant d'appliquer cette version.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVersionARestaurer(null)}
                className="rounded-md border border-border px-3 py-1 text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={enRestauration}
                onClick={executerRestauration}
                className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground inline-flex items-center gap-1.5"
              >
                {enRestauration && <Loader2 className="size-3 animate-spin" />} Restaurer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
