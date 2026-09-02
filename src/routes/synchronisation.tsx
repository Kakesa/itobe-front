/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { appareils } from "@/lib/admin-data";
import { bibliotheque, getLivre, nomAuteur } from "@/lib/data";

export const Route = createFileRoute("/synchronisation")({
  head: () => ({
    meta: [
      { title: "Synchroniser ma lecture entre mes appareils | Itobe" },
      {
        name: "description",
        content:
          "Synchronisez votre progression de lecture entre mobile, tablette et ordinateur, choisissez où reprendre et résolvez les conflits de position.",
      },
      { property: "og:title", content: "Synchronisation multi-appareils | Itobe" },
      {
        property: "og:description",
        content: "Reprise de lecture et résolution des conflits de progression.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Synchronisation,
});

function Synchronisation() {
  const [etat, setEtat] = useState<"repos" | "encours" | "fait">("repos");
  const [auto, setAuto] = useState(true);
  const [conflitResolu, setConflitResolu] = useState<string | null>(null);
  const livre = getLivre(Object.keys(bibliotheque.progression)[0] ?? "");

  const lancer = () => {
    setEtat("encours");
    setTimeout(() => setEtat("fait"), 1400);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="kicker">Espace lecteur</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Synchronisation de la lecture</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Votre position de lecture, vos marque-pages et vos notes circulent entre tous vos appareils.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4 rounded-sm border border-border bg-card p-5">
        <button
          type="button"
          onClick={lancer}
          disabled={etat === "encours"}
          className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {etat === "encours" ? "Synchronisation…" : "Synchroniser maintenant"}
        </button>
        <span className="text-sm text-muted-foreground">
          {etat === "fait"
            ? "Tout est à jour — dernière synchronisation à l'instant."
            : "Dernière synchronisation : il y a 3 minutes."}
        </span>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          Synchronisation automatique
        </label>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl">Mes appareils</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {appareils.map((a) => (
            <div
              key={a.id}
              className={`rounded-sm border p-5 ${
                a.actuel ? "border-accent bg-accent/5" : "border-border bg-card"
              }`}
            >
              <p className="font-display text-lg">{a.nom}</p>
              <p className="text-xs text-muted-foreground">{a.type}</p>
              <p className="mt-3 text-sm">Page {a.page}</p>
              <p className="text-xs text-muted-foreground">Sync : {a.derniereSync}</p>
              {a.actuel ? (
                <p className="mt-3 text-xs text-accent">Appareil actuel</p>
              ) : (
                <button type="button" className="mt-3 text-xs text-destructive hover:underline">
                  Dissocier
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {livre && (
        <section className="mt-12">
          <h2 className="text-2xl">Conflit de progression</h2>
          <div className="mt-6 rounded-sm border border-border bg-card p-6">
            <p className="text-sm">
              « {livre.titre} » — {nomAuteur(livre.auteur)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Deux positions différentes ont été enregistrées pour cet ouvrage.
            </p>

            {conflitResolu ? (
              <p className="mt-5 text-sm text-accent">
                Conflit résolu : reprise à la {conflitResolu}.
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { cle: "page 143 (iPad salon)", detail: "Hier, 21:40 — position la plus avancée" },
                  { cle: "page 128 (iPhone de Nadia)", detail: "Il y a 3 minutes — appareil actuel" },
                ].map((o) => (
                  <div key={o.cle} className="rounded-sm border border-border p-4">
                    <p className="text-sm capitalize">{o.cle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{o.detail}</p>
                    <button
                      type="button"
                      onClick={() => setConflitResolu(o.cle)}
                      className="mt-4 rounded-sm bg-accent px-4 py-2 text-sm text-accent-foreground"
                    >
                      Reprendre ici
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/reader/$slug"
              params={{ slug: livre.slug }}
              className="mt-6 inline-block text-sm text-accent hover:underline"
            >
              Ouvrir le lecteur →
            </Link>
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-2xl">Journal de synchronisation</h2>
        <ul className="mt-6 divide-y divide-border rounded-sm border border-border bg-card text-sm">
          {[
            ["il y a 3 min", "Position mise à jour depuis iPhone de Nadia — page 128"],
            ["hier, 21:40", "Marque-page ajouté depuis iPad salon — page 143"],
            ["il y a 4 jours", "Préférences de lecture synchronisées depuis MacBook bureau"],
          ].map(([q, t]) => (
            <li key={t} className="flex gap-4 px-4 py-3">
              <span className="w-28 shrink-0 text-xs text-muted-foreground">{q}</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
