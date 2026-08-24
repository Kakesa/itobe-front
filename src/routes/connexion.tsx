import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { authentifierApi, sauvegarderSession } from "@/lib/auth";
import { AuthApi } from "@/lib/api-client";
import { fusionnerPanierApresConnexion } from "@/lib/panier/merge-on-login";
import { useSession } from "@/hooks/use-session";
import { BookOpen, Newspaper, Shield } from "lucide-react";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/connexion")({
  validateSearch: searchSchema,
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
  const { redirect } = Route.useSearch();
  const destination = redirect && redirect.startsWith("/") ? redirect : "/admin";
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();
  const { session, deconnexion } = useSession();

  const soumettre = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      if (mode === "inscription") {
        const data = await AuthApi.register({
          nom: nom.trim(),
          email: email.trim(),
          password,
          telephone: telephone.trim(),
          adresse: adresse.trim(),
          role: "lecteur",
        });

        if (data?.user) {
          const user = data.user;
          sauvegarderSession({
            id: user._id || user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom || "",
            role: user.role,
          });
          await fusionnerPanierApresConnexion();
          void navigate({ to: destination });
          return;
        }
      } else {
        const user = await authentifierApi(email, password);
        if (!user) {
          setErreur("E-mail ou mot de passe incorrect.");
          return;
        }

        void navigate({ to: destination });
      }
    } catch (err: any) {
      setErreur(err.message || "Une erreur est survenue lors de la connexion.");
    } finally {
      setChargement(false);
    }
  };

  if (session) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="kicker">Connecté</p>
        <h1 className="mt-3 font-display text-3xl">
          Bonjour, {session.prenom || session.nom}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {session.email} · rôle <span className="font-medium text-foreground capitalize">{session.role}</span>
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
        <p className="kicker">Espace personnel & professionnel</p>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl">
          Bienvenue sur Itobe.
        </h1>
        <p className="mt-5 text-muted-foreground">
          Accédez à votre espace lecteur pour retrouver votre bibliothèque synchronisée, ou connectez-vous au back-office éditorial.
        </p>

        <div className="mt-8 space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-sm">
            <BookOpen className="mt-0.5 size-4 text-accent shrink-0" />
            <div>
              <p className="font-medium">Maison d&apos;Édition & Bibliothèque</p>
              <p className="text-xs text-muted-foreground">Lecture en ligne, achats d&apos;ouvrages et synchronisation multi-appareils.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-sm">
            <Newspaper className="mt-0.5 size-4 text-accent shrink-0" />
            <div>
              <p className="font-medium">Portail Média & Actualités</p>
              <p className="text-xs text-muted-foreground">Articles, grands reportages, analyses culturelles et économiques.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-sm">
            <Shield className="mt-0.5 size-4 text-accent shrink-0" />
            <div>
              <p className="font-medium">Accès sécurisé</p>
              <p className="text-xs text-muted-foreground">Gestion protégée de vos données et de vos abonnements.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-7 shadow-soft">
        <div className="flex gap-2">
          {(["connexion", "inscription"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setErreur("");
              }}
              className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                mode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "connexion" ? "Connexion" : "Créer un compte"}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={soumettre}>
          {mode === "inscription" && (
            <>
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Nom complet</span>
                <input
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Jean Mukendi"
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Numéro de téléphone</span>
                <input
                  required
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+243 81 234 5678"
                  autoComplete="tel"
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Adresse complète</span>
                <textarea
                  required
                  rows={2}
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: 12 Av. de la Paix, Commune de Gombe, Kinshasa"
                  autoComplete="street-address"
                  className="mt-1 w-full resize-none rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
                />
              </label>
            </>
          )}

          <label className="block text-sm">
            <span className="text-xs text-muted-foreground">Adresse e-mail</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@domaine.com"
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
            />
          </label>

          <label className="block text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Mot de passe</span>
              {mode === "connexion" && (
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-xs text-accent hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              )}
            </div>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-accent"
            />
          </label>

          {erreur && (
            <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="w-full rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {chargement ? "Veuillez patienter..." : mode === "connexion" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {mode === "connexion" ? (
            <>
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("inscription");
                  setErreur("");
                }}
                className="text-accent hover:underline"
              >
                Inscrivez-vous
              </button>
            </>
          ) : (
            <>
              Vous avez déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("connexion");
                  setErreur("");
                }}
                className="text-accent hover:underline"
              >
                Connectez-vous
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
