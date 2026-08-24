import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthApi } from "@/lib/api-client";

export const Route = createFileRoute("/mot-de-passe-oublie")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — Itobe" },
      {
        name: "description",
        content: "Demandez la réinitialisation de votre mot de passe Itobe.",
      },
      { property: "og:title", content: "Mot de passe oublié — Itobe" },
      { property: "og:url", content: "/mot-de-passe-oublie" },
    ],
    links: [{ rel: "canonical", href: "/mot-de-passe-oublie" }],
  }),
  component: MotDePasseOublie,
});

function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [lienDev, setLienDev] = useState("");

  const soumettre = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErreur("");
    setMessage("");
    setLienDev("");
    setChargement(true);

    try {
      const res = await AuthApi.forgotPassword(email.trim());
      const data = res?.data ?? res;
      setMessage(
        data?.message ||
          "Si un compte existe avec cette adresse e-mail, un lien de réinitialisation vous a été envoyé.",
      );
      if (data?.resetUrl) {
        setLienDev(data.resetUrl);
      }
    } catch (err: any) {
      setErreur(err.message || "Impossible d'envoyer la demande pour le moment.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="kicker">Accès au compte</p>
      <h1 className="mt-3 font-display text-3xl">Mot de passe oublié</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Saisissez l&apos;adresse e-mail de votre compte. Nous vous enverrons un lien pour choisir un
        nouveau mot de passe.
      </p>

      <form className="mt-8 space-y-4 rounded-sm border border-border bg-card p-6 shadow-soft" onSubmit={soumettre}>
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Adresse e-mail</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre.email@domaine.com"
            autoComplete="email"
            className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
          />
        </label>

        {erreur && (
          <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">{erreur}</p>
        )}

        {message && (
          <p className="rounded-sm bg-accent/10 px-3 py-2 text-sm text-accent">{message}</p>
        )}

        {lienDev && (
          <div className="rounded-sm border border-dashed border-border bg-secondary/40 px-3 py-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Mode développement</p>
            <p className="mt-1">Lien de réinitialisation (e-mail non configuré) :</p>
            <a href={lienDev} className="mt-2 block break-all text-accent hover:underline">
              {lienDev}
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={chargement}
          className="w-full rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {chargement ? "Envoi en cours..." : "Envoyer le lien"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/connexion" className="text-accent hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
