/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AccesRestreint } from "@/components/admin-ui";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { RowActionsMenu } from "@/components/admin/row-actions-menu";
import {
  ArticleEditorForm,
  articleVersForm,
  formVersItem,
  refChampApi,
  type ArticleFormValues,
} from "@/components/admin/article-editor-form";
import { formatDate, hydratePublicData, nomAuteur } from "@/lib/data";
import { etatsModeration, transitions, type EtatModeration } from "@/lib/admin-data";
import { useRole } from "@/hooks/use-role";
import { useCollection } from "@/lib/admin/store";
import { ArticlesApi, CategoriesApi, lireCategories } from "@/lib/api-client";
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";
import { useNotifierAbonnes } from "@/hooks/use-notifier-abonnes";

export const Route = createFileRoute("/admin/media/articles")({
  component: AdminArticles,
});

const TON: Record<string, string> = {
  Brouillon: "bg-secondary text-muted-foreground",
  "En revue": "bg-ochre/20 text-ochre-foreground",
  Programmé: "bg-ochre/20 text-ochre-foreground",
  Publié: "bg-accent/15 text-accent",
  Rejeté: "bg-destructive/10 text-destructive",
};

const LIBELLE: Record<EtatModeration, string> = {
  Brouillon: "Repasser en brouillon",
  "En revue": "Soumettre en revue",
  Publié: "Publier",
  Rejeté: "Rejeter",
};

function AdminArticles() {
  const { role } = useRole();
  const { items, creer, modifier, supprimer } = useCollection("articles");
  const { notifierSiPublication } = useNotifierAbonnes();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let actif = true;
    CategoriesApi.getAll("media")
      .then((reponse) => {
        const noms = lireCategories(reponse)
          .filter((item) => item.type !== "livre")
          .map((item) => item.nom);
        if (actif) setCategories([...new Set(noms)]);
      })
      .catch(() => {
        if (actif) setCategories([]);
      });
    return () => {
      actif = false;
    };
  }, []);
  const [mode, setMode] = useState<"liste" | "creer" | "editer">("liste");
  const [edition, setEdition] = useState<Item | null>(null);
  const [aSupprimer, setASupprimer] = useState<Item | null>(null);
  const [rejet, setRejet] = useState<Item | null>(null);
  const [motif, setMotif] = useState("");
  const [filtre, setFiltre] = useState("Toutes");
  const [q, setQ] = useState("");

  if (role !== "admin" && role !== "editeur") {
    return <AccesRestreint requis={["admin", "editeur"]} />;
  }

  const liste = items.filter(
    (a) =>
      (filtre === "Toutes" || a["categorie"] === filtre) &&
      String(a["titre"] ?? "")
        .toLowerCase()
        .includes(q.toLowerCase()),
  );

  const enregistrer = async (valeurs: ArticleFormValues) => {
    const payload = formVersItem(valeurs);

    try {
      if (edition) {
        const updated = await ArticlesApi.update(String(edition.id), payload);
        const saved = (updated as { data?: Record<string, unknown> })?.data ?? updated;
        modifier(edition.id, {
          ...payload,
          auteur: refChampApi(saved?.["auteur"], ["slug"]) || payload.auteur,
          categorie: refChampApi(saved?.["categorie"], ["nom", "slug"]) || payload.categorie,
        });
        notify.modifie("Article", String(payload["titre"]));
        notifierSiPublication("article", edition, { ...edition, ...payload });
      } else {
        const response = await ArticlesApi.create(payload);
        const created = response?.data ?? response ?? payload;
        const item = {
          ...created,
          id: String(created?.id ?? created?._id ?? `${Date.now()}`),
          auteur: refChampApi(created?.auteur, ["slug"]) || payload.auteur,
          categorie: refChampApi(created?.categorie, ["nom", "slug"]) || payload.categorie,
        } as Item;
        creer(item);
        notify.cree("Article", String(payload["titre"]));
        notifierSiPublication("article", null, item);
      }
      await hydratePublicData();
    } catch (error) {
      notify.erreur(
        error instanceof Error ? error.message : "Erreur lors de l'enregistrement de l'article",
      );
      return;
    }

    setMode("liste");
    setEdition(null);
  };

  const appliquer = async (row: Item, cible: EtatModeration, note?: string) => {
    const patch = {
      etat: cible,
      statut: cible === "Publié" ? "Publié" : cible === "En revue" ? "Programmé" : "Brouillon",
      ...(cible === "Publié" && !row["datePublication"]
        ? { datePublication: new Date().toISOString() }
        : {}),
    };

    try {
      await ArticlesApi.update(String(row.id), patch);
      modifier(row.id, patch);
      await hydratePublicData();
      notify.succes(`« ${String(row["titre"])} » → ${cible}`, { description: note });
      notifierSiPublication("article", row, { ...row, ...patch });
    } catch (error) {
      notify.erreur(
        error instanceof Error ? error.message : "Impossible de mettre à jour le statut de l'article",
      );
    }
  };

  if (mode === "creer" || mode === "editer") {
    return (
      <ArticleEditorForm
        initial={edition ? articleVersForm(edition) : undefined}
        onAnnuler={() => {
          setMode("liste");
          setEdition(null);
        }}
        onEnregistrer={enregistrer}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-2xl">Articles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Créer, programmer et publier les articles du portail Média. Publier notifie tous les
            abonnés ACTIVE par e-mail.
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un titre…"
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        />
        <select
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        >
          {["Toutes", ...categories].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setEdition(null);
            setMode("creer");
          }}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" /> Créer un article
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-180 text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-normal">Titre</th>
              <th className="px-4 py-3 font-normal">Catégorie</th>
              <th className="px-4 py-3 font-normal">Auteur</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">État</th>
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {liste.map((row) => {
              const etat = String(row["statut"] ?? row["etat"] ?? "Brouillon");
              const etatMod = (row["etat"] as EtatModeration) ?? "Brouillon";
              const cibles = transitions[role]?.[etatMod] ?? [];
              return (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{String(row["titre"])}</td>
                  <td className="px-4 py-3 text-muted-foreground">{String(row["categorie"])}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {nomAuteur(String(row["auteur"]))}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(String(row["date"] ?? new Date().toISOString().slice(0, 10)))}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${TON[etat] ?? ""}`}
                    >
                      {etat}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <RowActionsMenu
                        actions={[
                          ...cibles.map((c) => ({
                            label: LIBELLE[c],
                            onClick: () =>
                              c === "Rejeté" ? (setRejet(row), setMotif("")) : appliquer(row, c),
                            destructive: c === "Rejeté",
                          })),
                          {
                            label: "Modifier",
                            icon: Pencil,
                            separatorBefore: cibles.length > 0,
                            onClick: () => {
                              setEdition(row);
                              setMode("editer");
                            },
                          },
                          {
                            label: "Supprimer",
                            icon: Trash2,
                            destructive: true,
                            separatorBefore: true,
                            onClick: () => setASupprimer(row),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {liste.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Aucun article ne correspond.</p>
      )}

      <ConfirmDialog
        ouvert={!!aSupprimer}
        titre="Supprimer l'article ?"
        message={aSupprimer ? `« ${String(aSupprimer["titre"])} » sera définitivement retiré.` : ""}
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={() => {
          if (aSupprimer) {
            supprimer(aSupprimer.id);
            notify.supprime("Article", String(aSupprimer["titre"]));
          }
          setASupprimer(null);
        }}
      />

      {rejet && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="font-display text-xl">Rejeter « {String(rejet["titre"])} »</h3>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={4}
              placeholder="Motif du rejet…"
              className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejet(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={motif.trim().length < 4}
                onClick={() => {
                  appliquer(rejet, "Rejeté", motif.trim());
                  setRejet(null);
                }}
                className="rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground disabled:opacity-40"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
