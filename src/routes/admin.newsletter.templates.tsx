import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { RowActionsMenu } from "@/components/admin/row-actions-menu";
import { NewsletterEditor, NewsletterPreview } from "@/components/newsletter/newsletter-ui";
import { useCollection } from "@/lib/admin/store";
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";
import { useNotifierAbonnes } from "@/hooks/use-notifier-abonnes";
import { blocsDe, type Bloc } from "@/lib/newsletter/newsletter";

export const Route = createFileRoute("/admin/newsletter/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { items, creer, modifier, supprimer } = useCollection("templates");
  const { creer: creerCampagne } = useCollection("campagnes");
  const { notifier } = useNotifierAbonnes();
  const navigate = useNavigate();
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [aSupprimer, setASupprimer] = useState<Item | null>(null);

  const actif = items.find((t) => t.id === ouvert);

  const utiliserPourCampagne = (t: Item) => {
    const item = creerCampagne({
      nom: String(t["nom"]),
      sujet: String(t["sujet"] ?? t["nom"]),
      type: String(t["categorie"]) === "Notification" ? "notification" : "marketing",
      expediteur: "Itobe",
      emailExpediteur: "hello@itobe.cd",
      repondreA: "contact@itobe.cd",
      audience: "tous",
      template: t.id,
      statut: "DRAFT",
      creee: new Date().toISOString().slice(0, 16),
      envoiPrevu: "",
      envoyee: "",
      destinataires: 0,
      envoyes: 0,
      delivres: 0,
      ouvertures: 0,
      clics: 0,
      desabonnements: 0,
      blocs: blocsDe(t["blocs"]),
      journal: [
        {
          date: new Date().toISOString().slice(0, 16),
          action: `Créée depuis le template « ${t["nom"]} »`,
        },
      ],
    });
    notify.cree("Campagne", String(t["nom"]));
    void navigate({ to: "/admin/newsletter/campagne/$id", params: { id: item.id } });
  };

  const envoyerDirect = (t: Item) => {
    notifier({
      type: "manuelle",
      titre: String(t["nom"]),
      sujet: String(t["sujet"] ?? t["nom"]),
      blocs: blocsDe(t["blocs"]),
      templateId: t.id,
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-2xl">Templates</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Modèles déjà rédigés (objet + contenu). Choisissez-en un pour envoyer sans tout
            réécrire.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const t = creer({
              nom: "Nouveau template",
              sujet: "",
              description: "",
              usage: "",
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
          <article key={t.id} className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-soft">
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
              {String(t["categorie"] ?? "Modèle")}
            </p>
            <h3 className="mt-1 font-display text-lg">{String(t["nom"])}</h3>
            <p className="mt-2 text-sm font-medium text-foreground/90">
              Objet : {String(t["sujet"] || "—")}
            </p>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              {String(t["description"] ?? "")}
            </p>
            {Boolean(t["usage"]) && (
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Quand l&apos;utiliser :</span>{" "}
                {String(t["usage"])}
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              {blocsDe(t["blocs"]).length} bloc(s) prêts
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => utiliserPourCampagne(t)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Utiliser
              </button>
              <button
                type="button"
                onClick={() => envoyerDirect(t)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary"
                title="Envoyer immédiatement aux abonnés ACTIVE"
              >
                <Send className="size-3.5" /> Envoyer
              </button>
              <RowActionsMenu
                actions={[
                  {
                    label: "Modifier",
                    icon: Pencil,
                    onClick: () => setOuvert(t.id),
                  },
                  {
                    label: "Dupliquer",
                    icon: Copy,
                    onClick: () => {
                      const { id: _i, ...reste } = t;
                      creer({ ...reste, nom: `${String(t["nom"])} (copie)` });
                      notify.cree("Template", `${String(t["nom"])} (copie)`);
                    },
                  },
                  {
                    label: "Supprimer",
                    icon: Trash2,
                    destructive: true,
                    separatorBefore: true,
                    onClick: () => setASupprimer(t),
                  },
                ]}
              />
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
              value={String(actif["sujet"] ?? "")}
              onChange={(e) => modifier(actif.id, { sujet: e.target.value })}
              placeholder="Objet de l'e-mail"
              aria-label="Objet de l'e-mail"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={String(actif["usage"] ?? "")}
              onChange={(e) => modifier(actif.id, { usage: e.target.value })}
              placeholder="Quand l'utiliser"
              aria-label="Usage du template"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <textarea
              value={String(actif["description"] ?? "")}
              onChange={(e) => modifier(actif.id, { description: e.target.value })}
              placeholder="Description détaillée"
              aria-label="Description du template"
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <NewsletterEditor
              blocs={blocsDe(actif["blocs"])}
              onChange={(b: Bloc[]) => modifier(actif.id, { blocs: b })}
            />
          </section>
          <NewsletterPreview
            sujet={String(actif["sujet"] || actif["nom"])}
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
