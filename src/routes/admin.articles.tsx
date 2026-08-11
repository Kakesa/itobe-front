import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AccesRestreint } from "@/components/admin-ui";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  ArticleEditorForm,
  articleVersForm,
  formVersItem,
  type ArticleFormValues,
} from "@/components/admin/article-editor-form";
import { categoriesMedia, formatDate, nomAuteur } from "@/lib/data";
import { etatsModeration, transitions, type EtatModeration } from "@/lib/admin-data";
import { useRole } from "@/hooks/use-role";
import { useCollection } from "@/lib/admin/store";
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/admin/articles")({
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

  const enregistrer = (valeurs: ArticleFormValues) => {
    const payload = formVersItem(valeurs);
    if (edition) {
      modifier(edition.id, payload);
      notify.modifie("Article", String(payload["titre"]));
    } else {
      creer(payload);
      notify.cree("Article", String(payload["titre"]));
    }
    setMode("liste");
    setEdition(null);
  };

  const appliquer = (row: Item, cible: EtatModeration, note?: string) => {
    modifier(row.id, { etat: cible, statut: cible === "Publié" ? "Publié" : cible === "En revue" ? "Programmé" : "Brouillon" });
    notify.succes(`« ${String(row["titre"])} » → ${cible}`, { description: note });
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
            Créer, programmer et publier les articles du portail Média.
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
          {["Toutes", ...categoriesMedia].map((c) => (
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
        <table className="w-full min-w-[720px] text-sm">
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
                    <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                      {cibles.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            c === "Rejeté" ? (setRejet(row), setMotif("")) : appliquer(row, c)
                          }
                          className={`rounded-lg border px-2.5 py-1 ${
                            c === "Rejeté"
                              ? "border-destructive/40 text-destructive"
                              : "border-border hover:bg-secondary"
                          }`}
                        >
                          {LIBELLE[c]}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEdition(row);
                          setMode("editer");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 hover:bg-secondary"
                      >
                        <Pencil className="size-3.5" /> Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setASupprimer(row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2.5 py-1 text-destructive"
                      >
                        <Trash2 className="size-3.5" /> Supprimer
                      </button>
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
        message={
          aSupprimer
            ? `« ${String(aSupprimer["titre"])} » sera définitivement retiré.`
            : ""
        }
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
