import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { NewsletterEditor, NewsletterPreview } from "@/components/newsletter/newsletter-ui";
import { useCollection } from "@/lib/admin/store";
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";
import { blocsDe, type Bloc } from "@/lib/newsletter/newsletter";

export const Route = createFileRoute("/admin/newsletter/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { items, creer, modifier, supprimer } = useCollection("templates");
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [aSupprimer, setASupprimer] = useState<Item | null>(null);

  const actif = items.find((t) => t.id === ouvert);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl">Templates</h2>
        <button
          type="button"
          onClick={() => {
            const t = creer({
              nom: "Nouveau template",
              description: "",
              categorie: "Média",
              blocs: [],
            });
            setOuvert(t.id);
            notify.cree("Template", "Nouveau template");
          }}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" /> Créer un template
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((t) => (
          <article key={t.id} className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
              {String(t["categorie"] ?? "Modèle")}
            </p>
            <h3 className="mt-1 font-display text-lg">{String(t["nom"])}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{String(t["description"] ?? "")}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {blocsDe(t["blocs"]).length} bloc(s)
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOuvert(t.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 hover:bg-secondary"
              >
                <Pencil className="size-3.5" /> Modifier
              </button>
              <button
                type="button"
                onClick={() => {
                  const { id: _i, ...reste } = t;
                  creer({ ...reste, nom: `${String(t["nom"])} (copie)` });
                  notify.cree("Template", `${String(t["nom"])} (copie)`);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 hover:bg-secondary"
              >
                <Copy className="size-3.5" /> Dupliquer
              </button>
              <button
                type="button"
                onClick={() => setASupprimer(t)}
                className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2.5 py-1 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" /> Supprimer
              </button>
            </div>
          </article>
        ))}
      </div>

      {actif && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg">Édition du template</h3>
              <button
                type="button"
                onClick={() => {
                  setOuvert(null);
                  notify.modifie("Template", String(actif["nom"]));
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary"
              >
                Terminer
              </button>
            </div>
            <input
              value={String(actif["nom"])}
              onChange={(e) => modifier(actif.id, { nom: e.target.value })}
              placeholder="Nom du template"
              aria-label="Nom du template"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={String(actif["description"] ?? "")}
              onChange={(e) => modifier(actif.id, { description: e.target.value })}
              placeholder="Description"
              aria-label="Description du template"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <NewsletterEditor
              blocs={blocsDe(actif["blocs"])}
              onChange={(b: Bloc[]) => modifier(actif.id, { blocs: b })}
            />
          </section>
          <NewsletterPreview
            sujet={String(actif["nom"])}
            expediteur="Itobe Entreprise"
            blocs={blocsDe(actif["blocs"])}
          />
        </div>
      )}

      <ConfirmDialog
        ouvert={!!aSupprimer}
        titre="Supprimer ce template ?"
        message={aSupprimer ? `« ${String(aSupprimer["nom"])} » sera supprimé définitivement.` : ""}
        onAnnuler={() => {
          setASupprimer(null);
          notify.annule("Suppression annulée");
        }}
        onConfirmer={() => {
          if (aSupprimer) {
            const nom = String(aSupprimer["nom"]);
            supprimer(aSupprimer.id);
            notify.supprime("Template", nom);
          }
          setASupprimer(null);
        }}
      />
    </div>
  );
}
