import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CrudModule } from "@/components/admin/crud-module";
import { categoriesMedia, formatDate, nomAuteur, auteurs } from "@/lib/data";
import { etatsModeration, transitions, type EtatModeration } from "@/lib/admin-data";
import { useRole } from "@/hooks/use-role";
import { useCollection } from "@/lib/admin/store";
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/admin/articles")({
  component: AdminArticles,
});

const TON: Record<EtatModeration, string> = {
  Brouillon: "bg-secondary text-muted-foreground",
  "En revue": "bg-ochre/20 text-ochre-foreground",
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
  const { modifier } = useCollection("articles");
  const [rejet, setRejet] = useState<Item | null>(null);
  const [motif, setMotif] = useState("");

  const appliquer = (row: Item, cible: EtatModeration, note?: string) => {
    modifier(row.id, { etat: cible });
    notify.succes(`« ${String(row["titre"])} » → ${cible}`, { description: note });
  };

  return (
    <>
      <CrudModule
        titre="Articles"
        singulier="Article"
        description="Workflow éditorial : brouillon → en revue → publié / rejeté."
        collection="articles"
        requis={["admin", "editeur"]}
        clesRecherche={["titre", "chapo"]}
        filtre={{ cle: "categorie", label: "Catégorie", options: categoriesMedia }}
        colonnes={[
          { cle: "titre", label: "Titre" },
          { cle: "categorie", label: "Catégorie", classe: "text-muted-foreground" },
          {
            cle: "auteur",
            label: "Auteur",
            classe: "text-muted-foreground",
            rendu: (r) => nomAuteur(String(r["auteur"])),
          },
          {
            cle: "date",
            label: "Date",
            classe: "text-muted-foreground",
            rendu: (r) => formatDate(String(r["date"])),
          },
          {
            cle: "etat",
            label: "État",
            rendu: (r) => (
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${
                  TON[r["etat"] as EtatModeration] ?? ""
                }`}
              >
                {String(r["etat"])}
              </span>
            ),
          },
        ]}
        champs={[
          { nom: "titre", label: "Titre", requis: true },
          { nom: "chapo", label: "Chapô", type: "textarea" },
          { nom: "categorie", label: "Catégorie", type: "select", options: categoriesMedia },
          {
            nom: "auteur",
            label: "Auteur",
            type: "select",
            options: auteurs.map((a) => a.slug),
          },
          { nom: "date", label: "Date", type: "date" },
          { nom: "lecture", label: "Temps de lecture", placeholder: "5 min" },
          { nom: "etat", label: "État", type: "select", options: etatsModeration },
        ]}
        actionsLigne={(row) => {
          const etat = (row["etat"] as EtatModeration) ?? "Brouillon";
          const cibles = transitions[role][etat] ?? [];
          return cibles.map((c) => (
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
          ));
        }}
      />

      {rejet && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Motif de rejet"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <h3 className="font-display text-xl">Rejeter « {String(rejet["titre"])} »</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Le motif est renvoyé à l&apos;auteur, qui pourra corriger et resoumettre.
            </p>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={4}
              aria-label="Motif de rejet"
              placeholder="Sources insuffisantes, ton à revoir…"
              className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="mt-5 flex flex-wrap justify-end gap-3">
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
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-40"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
