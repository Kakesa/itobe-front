import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { formules } from "@/lib/admin-data";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Abonnement Premium — lecture illimitée | Itobe" },
      {
        name: "description",
        content:
          "Activez, renouvelez ou annulez l'abonnement Premium Itobe : lecture illimitée, téléchargements et contenus exclusifs sur tous vos appareils.",
      },
      { property: "og:title", content: "Abonnement Premium | Itobe" },
      {
        property: "og:description",
        content: "Lecture illimitée, téléchargements et contenus exclusifs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/premium" }],
  }),
  component: Premium,
});

type Etat = "inactif" | "actif" | "annule";

function Premium() {
  const [etat, setEtat] = useState<Etat>("inactif");
  const [choix, setChoix] = useState<"mensuel" | "annuel">("annuel");
  const [renouvellement, setRenouvellement] = useState(true);
  const formule = formules.find((f) => f.id === choix)!;
  const echeance = choix === "annuel" ? "2027-08-05" : "2026-09-05";

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="kicker">Abonnement</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Itobe Premium</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Tout le catalogue en lecture illimitée, les archives du Média et les contenus exclusifs
        réservés aux abonnés.
      </p>

      {etat === "actif" && (
        <div className="mt-8 rounded-sm border border-accent bg-accent/5 p-5 text-sm">
          Abonnement <strong>{formule.label}</strong> actif — prochaine échéance le{" "}
          {formatDate(echeance)}
          {renouvellement ? " (renouvellement automatique)" : " (sans renouvellement)"}.
        </div>
      )}
      {etat === "annule" && (
        <div className="mt-8 rounded-sm border border-border bg-card p-5 text-sm">
          Votre abonnement est annulé. Vous conservez l'accès Premium jusqu'au{" "}
          {formatDate(echeance)}.
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
            }}
            className="rounded-sm border border-border px-5 py-2.5 text-sm disabled:opacity-40"
          >
            Renouveler maintenant
          </button>
          <button
            type="button"
            disabled={etat !== "actif"}
            onClick={() => {
              setEtat("annule");
              setRenouvellement(false);
            }}
            className="rounded-sm border border-border px-5 py-2.5 text-sm text-destructive disabled:opacity-40"
          >
            Annuler l'abonnement
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-border p-4">
            <p className="text-xs text-muted-foreground">Statut</p>
            <p className="mt-1 text-sm capitalize">
              {etat === "inactif" ? "Aucun abonnement" : etat === "actif" ? "Actif" : "Annulé"}
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

        <p className="kicker mt-8">Historique de facturation</p>
        <ul className="mt-3 divide-y divide-border text-sm">
          {[
            ["2026-07-05", "Premium mensuel", "6,99 $"],
            ["2026-06-05", "Premium mensuel", "6,99 $"],
            ["2026-05-05", "Premium mensuel", "6,99 $"],
          ].map(([d, l, m]) => (
            <li key={d} className="flex items-center justify-between gap-3 py-2">
              <span className="text-muted-foreground">{formatDate(d)}</span>
              <span className="flex-1 truncate">{l}</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Vous préférez acheter à l'unité ?{" "}
        <Link to="/edition" className="text-accent hover:underline">
          Parcourir le catalogue
        </Link>
      </p>
    </div>
  );
}
