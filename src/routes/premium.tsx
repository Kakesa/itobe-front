import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Download, ReceiptText, RefreshCw, X } from "lucide-react";
import { factures, formules } from "@/lib/admin-data";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Abonnement Premium — lecture illimitée | Itobe" },
      {
        name: "description",
        content:
          "Activez, renouvelez ou annulez l'abonnement Premium Itobe : échéances, factures, lecture illimitée et contenus exclusifs sur tous vos appareils.",
      },
      { property: "og:title", content: "Abonnement Premium | Itobe" },
      {
        property: "og:description",
        content: "Échéances, factures, lecture illimitée et contenus exclusifs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/premium" }],
  }),
  component: Premium,
});

type Etat = "inactif" | "actif" | "annule";

function joursRestants(date: string) {
  const diff = new Date(date).getTime() - new Date("2026-08-07").getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

function Premium() {
  const [etat, setEtat] = useState<Etat>("actif");
  const [choix, setChoix] = useState<"mensuel" | "annuel">("annuel");
  const [renouvellement, setRenouvellement] = useState(true);
  const [confirmation, setConfirmation] = useState(false);
  const [motif, setMotif] = useState("Trop cher");
  const [message, setMessage] = useState<string | null>(null);

  const formule = formules.find((f) => f.id === choix)!;
  const echeance = choix === "annuel" ? "2027-08-05" : "2026-09-05";
  const restants = joursRestants(echeance);

  const annulerImmediatement = () => {
    setEtat("annule");
    setRenouvellement(false);
    setConfirmation(false);
    setMessage(
      "Abonnement annulé immédiatement. L'accès Premium est désactivé et aucun prélèvement ne sera effectué.",
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="kicker">Abonnement</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Itobe Premium</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Tout le catalogue en lecture illimitée, les archives du Média et les contenus exclusifs
        réservés aux abonnés.
      </p>

      {message && (
        <div className="mt-8 flex items-start gap-3 rounded-sm border border-border bg-card p-5 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-terracotta" />
          <span>{message}</span>
        </div>
      )}

      {etat === "actif" && (
        <section className="mt-8 grid gap-4 rounded-sm border border-accent bg-accent/5 p-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Formule en cours</p>
            <p className="mt-1 font-display text-xl">{formule.label}</p>
            <p className="text-xs text-muted-foreground">
              {formule.prix.toFixed(2)} $ {formule.periode}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prochain renouvellement</p>
            <p className="mt-1 font-display text-xl">{formatDate(echeance)}</p>
            <p className="text-xs text-muted-foreground">dans {restants} jours</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prélèvement automatique</p>
            <p className="mt-1 font-display text-xl">{renouvellement ? "Activé" : "Désactivé"}</p>
            <p className="text-xs text-muted-foreground">Mobile Money •••• 4412</p>
          </div>
        </section>
      )}
      {etat === "annule" && (
        <div className="mt-8 rounded-sm border border-border bg-card p-5 text-sm">
          Votre abonnement est annulé. Vous pouvez le réactiver à tout moment ci-dessous.
        </div>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {formules.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setChoix(f.id)}
            className={`rounded-sm border p-6 text-left ${
              choix === f.id ? "border-accent bg-accent/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-xl">{f.label}</p>
              {f.economie && (
                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent">
                  {f.economie}
                </span>
              )}
            </div>
            <p className="mt-3 font-display text-4xl">
              {f.prix.toFixed(2)} $
              <span className="ml-2 text-sm text-muted-foreground">{f.periode}</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {f.avantages.map((a) => (
                <li key={a} className="flex gap-2">
                  <span className="text-accent">—</span> {a}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <section className="mt-12 rounded-sm border border-border bg-card p-6">
        <h2 className="text-2xl">Gérer mon abonnement</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Formule sélectionnée : {formule.label} — {formule.prix.toFixed(2)} $ {formule.periode}.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={etat === "actif"}
            onClick={() => {
              setEtat("actif");
              setRenouvellement(true);
              setMessage("Abonnement activé. Bonne lecture !");
            }}
            className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
          >
            Activer l'abonnement
          </button>
          <button
            type="button"
            disabled={etat === "inactif"}
            onClick={() => {
              setEtat("actif");
              setRenouvellement(true);
              setMessage(`Renouvellement effectué — prochaine échéance le ${formatDate(echeance)}.`);
            }}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-2.5 text-sm disabled:opacity-40"
          >
            <RefreshCw className="size-4" />
            Renouveler maintenant
          </button>
          <button
            type="button"
            disabled={etat !== "actif"}
            onClick={() => setConfirmation(true)}
            className="rounded-sm border border-destructive/40 px-5 py-2.5 text-sm text-destructive disabled:opacity-40"
          >
            Annuler immédiatement
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-sm border border-border p-4">
            <p className="text-xs text-muted-foreground">Statut</p>
            <p className="mt-1 text-sm">
              {etat === "inactif" ? "Aucun abonnement" : etat === "actif" ? "Actif" : "Annulé"}
            </p>
          </div>
          <div className="rounded-sm border border-border p-4">
            <p className="text-xs text-muted-foreground">Prochaine échéance</p>
            <p className="mt-1 text-sm">
              {etat === "actif" ? `${formatDate(echeance)} · J-${restants}` : "—"}
            </p>
          </div>
          <div className="rounded-sm border border-border p-4">
            <p className="text-xs text-muted-foreground">Renouvellement automatique</p>
            <button
              type="button"
              disabled={etat !== "actif"}
              onClick={() => setRenouvellement((v) => !v)}
              className="mt-1 text-sm text-accent hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {renouvellement ? "Activé — désactiver" : "Désactivé — activer"}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-sm border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <ReceiptText className="size-4 text-accent" />
          <h2 className="text-2xl">Factures</h2>
          <button
            type="button"
            className="ml-auto rounded-sm border border-border px-4 py-2 text-xs hover:bg-secondary"
          >
            Tout télécharger
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                {["Référence", "Date", "Libellé", "Moyen", "Montant", "Statut", ""].map((h) => (
                  <th key={h} className="py-2 pr-4 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {factures.map((f) => (
                <tr key={f.id}>
                  <td className="py-3 pr-4 text-muted-foreground">{f.id}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{formatDate(f.date)}</td>
                  <td className="py-3 pr-4">{f.libelle}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{f.moyen}</td>
                  <td className="py-3 pr-4">{f.montant.toFixed(2)} $</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${
                        f.statut === "Payée"
                          ? "bg-accent/15 text-accent"
                          : f.statut === "Échouée"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-ochre/15 text-ochre-foreground"
                      }`}
                    >
                      {f.statut}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {f.statut === "Échouée" ? (
                      <button type="button" className="text-xs text-accent hover:underline">
                        Relancer le paiement
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                      >
                        <Download className="size-3.5" />
                        Reçu PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Vous préférez acheter à l'unité ?{" "}
        <Link to="/edition" className="text-accent hover:underline">
          Parcourir le catalogue
        </Link>
      </p>

      {confirmation && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirmer l'annulation"
            className="w-full max-w-md rounded-sm border border-border bg-card p-6 shadow-book"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-xl">Annuler immédiatement ?</h3>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setConfirmation(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              L'accès Premium sera coupé sur-le-champ, y compris les téléchargements hors ligne. La
              période en cours (jusqu'au {formatDate(echeance)}) ne sera pas remboursée.
            </p>

            <label className="mt-5 block text-sm">
              <span className="text-xs text-muted-foreground">Motif de l'annulation</span>
              <select
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
              >
                {["Trop cher", "Je ne lis plus assez", "Catalogue insuffisant", "Autre"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmation(false)}
                className="rounded-sm border border-border px-4 py-2 text-sm"
              >
                Garder Premium
              </button>
              <button
                type="button"
                onClick={annulerImmediatement}
                className="rounded-sm bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
              >
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
