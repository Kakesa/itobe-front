import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { bibliotheque, getLivre, nomAuteur } from "@/lib/data";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil et mes préférences de lecture | Itobe" },
      {
        name: "description",
        content:
          "Gérez vos informations, la newsletter, le thème clair ou sombre, la taille du texte et suivez votre progression de lecture sur Itobe.",
      },
      { property: "og:title", content: "Mon profil et mes préférences | Itobe" },
      {
        property: "og:description",
        content: "Notifications, préférences de lecture et progression personnelle.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Profil,
});

function Interrupteur({
  actif,
  onChange,
  label,
  aide,
}: {
  actif: boolean;
  onChange: (v: boolean) => void;
  label: string;
  aide: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{aide}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        aria-label={label}
        onClick={() => onChange(!actif)}
        className={`mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${
          actif ? "bg-accent" : "bg-secondary"
        }`}
      >
        <span
          className={`block size-5 rounded-full bg-background transition-transform ${
            actif ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Profil() {
  const [newsletter, setNewsletter] = useState(true);
  const [nouveautes, setNouveautes] = useState(true);
  const [resume, setResume] = useState(false);
  const [theme, setTheme] = useState<"clair" | "sombre" | "auto">("clair");
  const [taille, setTaille] = useState(18);
  const [enregistre, setEnregistre] = useState(false);

  const progression = Object.entries(bibliotheque.progression);
  const moyenne = Math.round(
    progression.reduce((s, [, p]) => s + p, 0) / Math.max(progression.length, 1),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="kicker">Espace lecteur</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Mon profil</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Vos informations, vos notifications et vos préférences de lecture, appliquées à tous vos
        appareils.
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <section className="rounded-sm border border-border bg-card p-6">
            <h2 className="text-xl">Informations</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Nom complet", "Nadia Kabeya"],
                ["Adresse e-mail", "nadia.kabeya@example.cd"],
                ["Téléphone", "+243 81 000 00 00"],
                ["Ville", "Kinshasa"],
              ].map(([label, valeur]) => (
                <label key={label} className="block text-sm">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <input
                    defaultValue={valeur}
                    className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-sm border border-border bg-card p-6">
            <h2 className="text-xl">Notifications</h2>
            <div className="mt-3">
              <Interrupteur
                actif={newsletter}
                onChange={setNewsletter}
                label="Newsletter hebdomadaire"
                aide="Le meilleur du portail Média, chaque vendredi."
              />
              <Interrupteur
                actif={nouveautes}
                onChange={setNouveautes}
                label="Nouveautés du catalogue"
                aide="Alerte à chaque nouvelle parution ou promotion."
              />
              <Interrupteur
                actif={resume}
                onChange={setResume}
                label="Résumé de lecture mensuel"
                aide="Vos statistiques de lecture envoyées par e-mail."
              />
            </div>
          </section>

          <section className="rounded-sm border border-border bg-card p-6">
            <h2 className="text-xl">Préférences de lecture</h2>

            <p className="mt-5 text-xs text-muted-foreground">Thème du lecteur</p>
            <div className="mt-2 flex gap-2">
              {(["clair", "sombre", "auto"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`rounded-full px-4 py-1.5 text-sm capitalize ${
                    theme === t
                      ? "bg-accent text-accent-foreground"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <p className="mt-6 text-xs text-muted-foreground">Taille du texte — {taille} px</p>
            <input
              type="range"
              min={14}
              max={26}
              step={1}
              value={taille}
              onChange={(e) => setTaille(Number(e.target.value))}
              aria-label="Taille du texte"
              className="mt-2 w-full accent-[var(--accent)]"
            />
            <p
              className="mt-4 rounded-sm border border-border bg-background p-4 leading-relaxed"
              style={{ fontSize: `${taille}px` }}
            >
              Le matin se levait lentement sur le fleuve, et la ville, encore engourdie, semblait
              relire ses propres pages.
            </p>
          </section>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setEnregistre(true)}
              className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Enregistrer mes préférences
            </button>
            {enregistre && <span className="text-sm text-accent">Préférences enregistrées.</span>}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-sm border border-border bg-card p-6">
            <p className="kicker">Ma progression</p>
            <p className="mt-3 font-display text-4xl">{moyenne} %</p>
            <p className="text-xs text-muted-foreground">progression moyenne</p>

            <ul className="mt-6 space-y-4">
              {progression.map(([slug, pct]) => {
                const l = getLivre(slug);
                if (!l) return null;
                return (
                  <li key={slug}>
                    <p className="text-sm">{l.titre}</p>
                    <p className="text-xs text-muted-foreground">{nomAuteur(l.auteur)}</p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{pct} % lu</p>
                  </li>
                );
              })}
            </ul>

            <Link
              to="/synchronisation"
              className="mt-6 inline-block text-sm text-accent hover:underline"
            >
              Synchroniser mes appareils →
            </Link>
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <p className="kicker">Abonnement</p>
            <p className="mt-3 text-sm">Formule actuelle : Gratuite</p>
            <Link
              to="/premium"
              className="mt-4 inline-block rounded-sm bg-accent px-4 py-2 text-sm text-accent-foreground"
            >
              Passer à Premium
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
