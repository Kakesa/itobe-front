import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — Espace lecteur Itobe" },
      {
        name: "description",
        content:
          "Connectez-vous à votre compte Itobe pour accéder à votre bibliothèque, vos achats et votre progression de lecture.",
      },
      { property: "og:title", content: "Connexion — Espace lecteur Itobe" },
      { property: "og:description", content: "Accédez à votre bibliothèque numérique." },
      { property: "og:url", content: "/connexion" },
    ],
    links: [{ rel: "canonical", href: "/connexion" }],
  }),
  component: Connexion,
});

function Connexion() {
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");

  return (
    <div className="mx-auto grid max-w-5xl gap-14 px-4 py-16 md:grid-cols-2 md:items-center">
      <div>
        <p className="kicker">Espace personnel</p>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl">
          Votre bibliothèque vous attend.
        </h1>
        <p className="mt-5 text-muted-foreground">
          Retrouvez vos livres achetés, vos favoris et votre progression de lecture sur tous vos
          appareils.
        </p>
        <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
          {[
            "Lecture en ligne illimitée de vos ouvrages",
            "Téléchargement PDF / EPUB autorisé par l'éditeur",
            "Synchronisation automatique de la progression",
            "Paiement Mobile Money ou carte bancaire",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-accent">—</span> {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-sm border border-border bg-card p-7">
        <div className="flex gap-2">
          {(["connexion", "inscription"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-sm px-3 py-2 text-sm ${
                mode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "connexion" ? "Connexion" : "Créer un compte"}
            </button>
          ))}
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLFormElement).reset();
          }}
        >
          {mode === "inscription" && (
            <input
              required
              placeholder="Nom complet"
              className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
            />
          )}
          <input
            required
            type="email"
            placeholder="Adresse e-mail"
            className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
          />
          <input
            required
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
          />
          <button className="w-full rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
            {mode === "connexion" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Interface de démonstration — aucun compte n'est réellement créé.{" "}
          <Link to="/bibliotheque" className="text-accent hover:underline">
            Voir la bibliothèque
          </Link>
        </p>
      </div>
    </div>
  );
}
