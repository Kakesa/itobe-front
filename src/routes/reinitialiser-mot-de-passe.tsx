import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AuthApi } from "@/lib/api-client";

function lireTokenDepuisUrl() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const valeur = params.get("token");
  if (!valeur) return "";
  try {
    return decodeURIComponent(valeur).trim();
  } catch {
    return valeur.trim();
  }
}

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/reinitialiser-mot-de-passe")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Réinitialiser le mot de passe — Itobe" },
      {
        name: "description",
        content: "Choisissez un nouveau mot de passe pour votre compte Itobe.",
      },
      { property: "og:title", content: "Réinitialiser le mot de passe — Itobe" },
      { property: "og:url", content: "/reinitialiser-mot-de-passe" },
    ],
    links: [{ rel: "canonical", href: "/reinitialiser-mot-de-passe" }],
  }),
  component: ReinitialiserMotDePasse,
});

function ReinitialiserMotDePasse() {
  const { token: tokenUrl } = Route.useSearch();
  const navigate = useNavigate();
  const tokenDepuisRoute = tokenUrl ? lireTokenDepuisUrl() || tokenUrl.trim() : "";
  const [token, setToken] = useState(tokenDepuisRoute);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    const depuisUrl = lireTokenDepuisUrl() || tokenUrl?.trim() || "";
    if (depuisUrl) setToken(depuisUrl);
  }, [tokenUrl]);

  const soumettre = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErreur("");

    const tokenFinal = (lireTokenDepuisUrl() || tokenUrl?.trim() || token).trim();

    if (password.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmation) {
      setErreur("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    if (!tokenFinal) {
      setErreur("Lien de réinitialisation invalide. Demandez un nouveau lien.");
      return;
    }

    setChargement(true);

    try {
      await AuthApi.resetPassword({ token: tokenFinal, password });
      setSucces(true);
      setTimeout(() => {
        void navigate({ to: "/connexion" });
      }, 2500);
    } catch (err: any) {
      const msg = err.message || "Impossible de réinitialiser le mot de passe.";
      setErreur(
        err.statusCode === 400 && /invalide|expir/i.test(msg)
          ? `${msg} Demandez un nouveau lien ci-dessous — seul le dernier e-mail reçu est valide.`
          : msg,
      );
    } finally {
      setChargement(false);
    }
  };

  const tokenDetecte = Boolean(lireTokenDepuisUrl() || tokenUrl?.trim() || token.trim());

  if (succes) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="kicker">Mot de passe mis à jour</p>
        <h1 className="mt-3 font-display text-3xl">C&apos;est bon !</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Votre mot de passe a été réinitialisé. Redirection vers la connexion…
        </p>
        <Link
          to="/connexion"
          className="mt-8 inline-block rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="kicker">Accès au compte</p>
      <h1 className="mt-3 font-display text-3xl">Nouveau mot de passe</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Choisissez un mot de passe sécurisé pour votre compte Itobe.
        {tokenDetecte && (
          <span className="mt-2 block text-accent">Lien de réinitialisation détecté.</span>
        )}
      </p>

      <form className="mt-8 space-y-4 rounded-sm border border-border bg-card p-6 shadow-soft" onSubmit={soumettre}>
        {!tokenDetecte && (
          <label className="block text-sm">
            <span className="text-xs text-muted-foreground">Code de réinitialisation</span>
            <input
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Collez le code reçu par e-mail"
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
            />
          </label>
        )}

        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Nouveau mot de passe</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
          />
        </label>

        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Confirmer le mot de passe</span>
          <input
            required
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
          />
        </label>

        {erreur && (
          <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">{erreur}</p>
        )}

        <button
          type="submit"
          disabled={chargement}
          className="w-full rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {chargement ? "Enregistrement..." : "Réinitialiser le mot de passe"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/mot-de-passe-oublie" className="text-accent hover:underline">
          Demander un nouveau lien
        </Link>
        {" · "}
        <Link to="/connexion" className="text-accent hover:underline">
          Connexion
        </Link>
      </p>
    </div>
  );
}
