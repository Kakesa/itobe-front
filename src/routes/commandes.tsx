import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, BookOpen, Download, ReceiptText } from "lucide-react";
import { mesCommandes, type MaCommande } from "@/lib/admin-data";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/commandes")({
  head: () => ({
    meta: [
      { title: "Mes commandes — reçus et téléchargements | Itobe" },
      {
        name: "description",
        content:
          "Consultez l'historique de vos commandes Itobe : statut du paiement, reçu, téléchargement de vos livres et relance en cas d'échec.",
      },
      { property: "og:title", content: "Mes commandes | Itobe" },
      {
        property: "og:description",
        content: "Statut, reçus, téléchargements et actions en cas d'échec de paiement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Commandes,
});

const TON: Record<MaCommande["statut"], string> = {
  Payée: "bg-accent/15 text-accent",
  "En attente": "bg-ochre/20 text-ochre-foreground",
  Échouée: "bg-destructive/10 text-destructive",
  Remboursée: "bg-secondary text-muted-foreground",
};

const filtres = ["Toutes", "Payée", "En attente", "Échouée", "Remboursée"] as const;

function Commandes() {
  const [filtre, setFiltre] = useState<(typeof filtres)[number]>("Toutes");
  const [ouverte, setOuverte] = useState<string | null>(mesCommandes[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);

  const liste = mesCommandes.filter((c) => filtre === "Toutes" || c.statut === filtre);
  const total = mesCommandes
    .filter((c) => c.statut === "Payée")
    .reduce((s, c) => s + c.montant, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="kicker">Espace lecteur</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Mes commandes</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Historique complet de vos achats : statut du paiement, reçu, accès et téléchargement de vos
        ouvrages.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Commandes</p>
          <p className="mt-1 font-display text-3xl">{mesCommandes.length}</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total dépensé</p>
          <p className="mt-1 font-display text-3xl">{total.toFixed(2)} $</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">À régulariser</p>
          <p className="mt-1 font-display text-3xl">
            {mesCommandes.filter((c) => c.statut !== "Payée" && c.statut !== "Remboursée").length}
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-6 rounded-sm border border-accent bg-accent/5 p-4 text-sm">{message}</div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {filtres.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltre(f)}
            className={`rounded-full px-3 py-1 text-xs ${
              filtre === f
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {liste.map((c) => {
          const ouvert = ouverte === c.id;
          return (
            <li key={c.id} className="rounded-sm border border-border bg-card">
              <button
                type="button"
                onClick={() => setOuverte(ouvert ? null : c.id)}
                aria-expanded={ouvert}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-5 text-left"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg">{c.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.id} · {formatDate(c.date)} · {c.moyen}
                  </p>
                </div>
                <span className="ml-auto font-display text-lg">{c.montant.toFixed(2)} $</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs ${TON[c.statut]}`}>
                  {c.statut}
                </span>
              </button>

              {ouvert && (
                <div className="border-t border-border p-5">
                  <dl className="grid gap-4 text-sm sm:grid-cols-4">
                    {[
                      ["Référence de paiement", c.reference],
                      ["Format", c.format],
                      ["Moyen de paiement", c.moyen],
                      ["Date", formatDate(c.date)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="mt-1">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  {c.statut === "Échouée" && (
                    <div className="mt-5 flex items-start gap-3 rounded-sm border border-destructive/40 bg-destructive/5 p-4 text-sm">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Paiement échoué</p>
                        <p className="mt-1 text-xs text-muted-foreground">{c.motif}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    {c.statut === "Payée" && (
                      <>
                        <Link
                          to="/reader/$slug"
                          params={{ slug: c.slug }}
                          className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-2 text-accent-foreground"
                        >
                          <BookOpen className="size-4" />
                          Lire maintenant
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMessage(`Téléchargement de « ${c.titre} » lancé.`)}
                          className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2"
                        >
                          <Download className="size-4" />
                          Télécharger ({c.format})
                        </button>
                      </>
                    )}

                    {c.statut === "En attente" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setMessage(`Vérification du paiement ${c.reference} en cours…`)
                          }
                          className="rounded-sm bg-primary px-4 py-2 text-primary-foreground"
                        >
                          Vérifier le paiement
                        </button>
                        <button
                          type="button"
                          onClick={() => setMessage(`Commande ${c.id} annulée.`)}
                          className="rounded-sm border border-border px-4 py-2 text-destructive"
                        >
                          Annuler la commande
                        </button>
                      </>
                    )}

                    {c.statut === "Échouée" && (
                      <>
                        <Link
                          to="/achat/$slug"
                          params={{ slug: c.slug }}
                          className="rounded-sm bg-accent px-4 py-2 text-accent-foreground"
                        >
                          Réessayer le paiement
                        </Link>
                        <Link
                          to="/achat/$slug"
                          params={{ slug: c.slug }}
                          className="rounded-sm border border-border px-4 py-2"
                        >
                          Changer de moyen de paiement
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMessage("Notre équipe vous recontacte sous 24 h.")}
                          className="rounded-sm border border-border px-4 py-2 text-muted-foreground"
                        >
                          Contacter le support
                        </button>
                      </>
                    )}

                    {c.statut !== "Échouée" && (
                      <button
                        type="button"
                        onClick={() => setMessage(`Reçu ${c.id} téléchargé.`)}
                        className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2"
                      >
                        <ReceiptText className="size-4" />
                        Reçu PDF
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {liste.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">Aucune commande dans ce filtre.</p>
      )}

      <Link
        to="/bibliotheque"
        className="mt-10 inline-flex items-center gap-2 text-sm text-accent hover:underline"
      >
        <ArrowLeft className="size-4" />
        Retour à ma bibliothèque
      </Link>
    </div>
  );
}
