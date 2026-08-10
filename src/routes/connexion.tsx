import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  authentifier,
  comptesDemo,
  sauvegarderSession,
} from "@/lib/auth";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — Espace Itobe" },
      {
        name: "description",
        content:
          "Connectez-vous à votre compte Itobe pour accéder à votre bibliothèque ou au back-office.",
      },
      { property: "og:title", content: "Connexion — Espace Itobe" },
      { property: "og:description", content: "Accédez à votre espace Itobe." },
      { property: "og:url", content: "/connexion" },
    ],
    links: [{ rel: "canonical", href: "/connexion" }],
  }),
  component: Connexion,
});

function Connexion() {
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const [email, setEmail] = useState("admin@itobe.cd");
  const [password, setPassword] = useState("admin123");
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();
  const { session, deconnexion } = useSession();

  const soumettre = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErreur("");

    if (mode === "inscription") {
      setErreur("Inscription désactivée en démo — utilisez un compte ci-dessous.");
      return;
    }

    const user = authentifier(email, password);
    if (!user) {
      setErreur("E-mail ou mot de passe incorrect.");
      return;
    }

    sauvegarderSession(user);
    void navigate({ to: "/admin" });
  };

  if (session) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="kicker">Connecté</p>
        <h1 className="mt-3 font-display text-3xl">
          Bonjour, {session.prenom}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {session.email} · rôle <span className="font-medium text-foreground">{session.role}</span>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/admin"
            className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Ouvrir mon espace
          </Link>
          <button
            type="button"
            onClick={deconnexion}
            className="rounded-sm border border-border px-5 py-2.5 text-sm"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-14 px-4 py-16 md:grid-cols-2 md:items-center">
      <div>
        <p className="kicker">Espace personnel</p>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl">
          Connectez-vous à Itobe.
        </h1>
        <p className="mt-5 text-muted-foreground">
          Accédez au back-office, à votre bibliothèque ou à l&apos;espace éditeur.
        </p>

        <div className="mt-8 rounded-sm border border-border bg-card p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Comptes démo
          </p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            {comptesDemo.map((c) => (
              <li key={c.email}>
                <button
                  type="button"
                  className="text-left hover:text-foreground"
                  onClick={() => {
                    setMode("connexion");
                    setEmail(c.email);
                    setPassword(c.password);
                    setErreur("");
                  }}
                >
                  <span className="font-medium text-foreground">{c.role}</span>
                  {" — "}
                  {c.email} / {c.password}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-7">
        <div className="flex gap-2">
          {(["connexion", "inscription"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setErreur("");
              }}
              className={`flex-1 rounded-sm px-3 py-2 text-sm ${
                mode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "connexion" ? "Connexion" : "Créer un compte"}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={soumettre}>
          {mode === "inscription" && (
            <input
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom complet"
              className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Adresse e-mail"
            className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
          />
          {erreur && (
            <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erreur}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            {mode === "connexion" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Démo front — pas de serveur d&apos;auth.{" "}
          <Link to="/admin" className="text-accent hover:underline">
            Aller au dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
