import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { authentifierApi, sauvegarderSession } from "@/lib/auth";
import { AuthApi } from "@/lib/api-client";
import { fusionnerPanierApresConnexion } from "@/lib/panier/merge-on-login";
import { useSession } from "@/hooks/use-session";
import {
  destinationApresConnexion,
  parseRedirectPath,
} from "@/lib/redirect-navigation";
import type { Role } from "@/lib/admin-data";
import {
  classeChamp,
  connexionSchema,
  erreursParChamp,
  filtrerSaisieTelephone,
  inscriptionSchema,
  normaliserTelephoneRdc,
} from "@/lib/inscription-validation";
import { BookOpen, Newspaper, Shield } from "lucide-react";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["connexion", "inscription"]).optional(),
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
  const { redirect, mode: modeSearch } = Route.useSearch();
  const [mode, setMode] = useState<"connexion" | "inscription">(modeSearch ?? "connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [erreursChamps, setErreursChamps] = useState<Partial<Record<"nom" | "telephone" | "adresse" | "email" | "password" | "confirmation", string>>>({});
  const navigate = useNavigate();
  const { session, deconnexion } = useSession();

  type ChampFormulaire = "nom" | "telephone" | "adresse" | "email" | "password" | "confirmation";

  const effacerErreurChamp = (champ: ChampFormulaire) => {
    setErreursChamps((prev) => {
      if (!prev[champ]) return prev;
      const next = { ...prev };
      delete next[champ];
      return next;
    });
  };

  const changerMode = (m: "connexion" | "inscription") => {
    setMode(m);
    setErreur("");
    setErreursChamps({});
  };

  useEffect(() => {
    if (modeSearch) setMode(modeSearch);
  }, [modeSearch]);

  useEffect(() => {
    if (!session || !redirect) return;
    const cible = parseRedirectPath(redirect);
    if (cible) void navigate(cible);
  }, [session, redirect, navigate]);

  const allerApresAuth = (role: Role) => {
    if (redirect) {
      const cible = parseRedirectPath(redirect);
      if (cible) {
        void navigate(cible);
        return;
      }
    }
    void navigate({ to: destinationApresConnexion(role) });
  };

  const soumettre = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErreur("");
    setErreursChamps({});

    if (mode === "inscription") {
      const validation = inscriptionSchema.safeParse({
        nom,
        email,
        telephone,
        adresse,
        password,
        confirmation,
      });

      if (!validation.success) {
        setErreursChamps(erreursParChamp(validation.error));
        return;
      }
    } else {
      const validation = connexionSchema.safeParse({ email, password });
      if (!validation.success) {
        setErreursChamps(erreursParChamp(validation.error));
        return;
      }
    }

    setChargement(true);

    try {
      if (mode === "inscription") {
        const data = await AuthApi.register({
          nom: nom.trim(),
          email: email.trim(),
          password,
          telephone: normaliserTelephoneRdc(telephone.trim()) ?? telephone.trim(),
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
          allerApresAuth((user.role as Role) || "lecteur");
          return;
        }
      } else {
        const user = await authentifierApi(email, password);
        if (!user) {
          setErreur("E-mail ou mot de passe incorrect.");
          return;
        }

        allerApresAuth(user.role);
      }
    } catch (err: any) {
      if (mode === "inscription" && err.statusCode === 409) {
        setErreursChamps({ email: err.message || "Un compte existe déjà avec cette adresse e-mail." });
      } else if (err.statusCode === 422 && Array.isArray(err.errors)) {
        setErreur(err.errors.join(" "));
      } else {
        setErreur(err.message || "Une erreur est survenue lors de la connexion.");
      }
    } finally {
      setChargement(false);
    }
  };

  if (session) {
    const cibleAchat = redirect ? parseRedirectPath(redirect) : null;

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
          {cibleAchat ? (
            <button
              type="button"
              onClick={() => void navigate(cibleAchat)}
              className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Continuer mon achat
            </button>
          ) : (
            <Link
              to={destinationApresConnexion(session.role)}
              className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              {session.role === "lecteur" ? "Retour au catalogue" : "Ouvrir mon espace"}
            </Link>
          )}
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
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
        <div className="order-1 text-center md:order-1 md:text-left">
          <p className="kicker">Espace personnel & professionnel</p>
          <h1 className="mt-3 font-display text-3xl leading-tight md:text-5xl">
            Bienvenue sur Itobe.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground md:mx-0 md:mt-5 md:max-w-none md:text-base">
            Accédez à votre espace lecteur pour retrouver votre bibliothèque synchronisée, ou connectez-vous au back-office éditorial.
          </p>

          <div className="mt-8 hidden space-y-3 md:block">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-left text-sm">
              <BookOpen className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <p className="font-medium">Maison d&apos;Édition & Bibliothèque</p>
                <p className="text-xs text-muted-foreground">
                  Lecture en ligne, achats d&apos;ouvrages et synchronisation multi-appareils.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-left text-sm">
              <Newspaper className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <p className="font-medium">Portail Média & Actualités</p>
                <p className="text-xs text-muted-foreground">
                  Articles, grands reportages, analyses culturelles et économiques.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-left text-sm">
              <Shield className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <p className="font-medium">Accès sécurisé</p>
                <p className="text-xs text-muted-foreground">
                  Gestion protégée de vos données et de vos abonnements.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-2 rounded-sm border border-border bg-card p-5 shadow-soft sm:p-7 md:order-2">
          <div className="flex gap-2">
            {(["connexion", "inscription"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => changerMode(m)}
                className={`flex-1 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
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
                    value={nom}
                    onChange={(e) => {
                      setNom(e.target.value);
                      effacerErreurChamp("nom");
                    }}
                    placeholder="Ex: Jean Mukendi"
                    autoComplete="name"
                    aria-invalid={Boolean(erreursChamps.nom)}
                    className={classeChamp(Boolean(erreursChamps.nom))}
                  />
                  {erreursChamps.nom && (
                    <p className="mt-1 text-xs text-destructive">{erreursChamps.nom}</p>
                  )}
                </label>
                <label className="block text-sm">
                  <span className="text-xs text-muted-foreground">Numéro de téléphone</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={telephone}
                    onChange={(e) => {
                      setTelephone(filtrerSaisieTelephone(e.target.value));
                      effacerErreurChamp("telephone");
                    }}
                    placeholder="+243 81 234 5678"
                    autoComplete="tel"
                    aria-invalid={Boolean(erreursChamps.telephone)}
                    className={classeChamp(Boolean(erreursChamps.telephone))}
                  />
                  {erreursChamps.telephone ? (
                    <p className="mt-1 text-xs text-destructive">{erreursChamps.telephone}</p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Format RDC : +243 ou 0 suivi de 9 chiffres.
                    </p>
                  )}
                </label>
                <label className="block text-sm">
                  <span className="text-xs text-muted-foreground">Adresse complète</span>
                  <textarea
                    rows={2}
                    value={adresse}
                    onChange={(e) => {
                      setAdresse(e.target.value);
                      effacerErreurChamp("adresse");
                    }}
                    placeholder="Ex: 12 Av. de la Paix, Commune de Gombe, Kinshasa"
                    autoComplete="street-address"
                    aria-invalid={Boolean(erreursChamps.adresse)}
                    className={`${classeChamp(Boolean(erreursChamps.adresse))} resize-none`}
                  />
                  {erreursChamps.adresse && (
                    <p className="mt-1 text-xs text-destructive">{erreursChamps.adresse}</p>
                  )}
                </label>
              </>
            )}

            <label className="block text-sm">
              <span className="text-xs text-muted-foreground">Adresse e-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  effacerErreurChamp("email");
                }}
                placeholder="votre.email@domaine.com"
                autoComplete="email"
                aria-invalid={Boolean(erreursChamps.email)}
                className={classeChamp(Boolean(erreursChamps.email))}
              />
              {erreursChamps.email && (
                <p className="mt-1 text-xs text-destructive">{erreursChamps.email}</p>
              )}
            </label>

            <label className="block text-sm">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <span className="text-xs text-muted-foreground">Mot de passe</span>
                {mode === "connexion" && (
                  <Link to="/mot-de-passe-oublie" className="text-xs text-accent hover:underline">
                    Mot de passe oublié ?
                  </Link>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  effacerErreurChamp("password");
                }}
                placeholder="••••••••"
                autoComplete={mode === "connexion" ? "current-password" : "new-password"}
                aria-invalid={Boolean(erreursChamps.password)}
                className={classeChamp(Boolean(erreursChamps.password))}
              />
              {erreursChamps.password && (
                <p className="mt-1 text-xs text-destructive">{erreursChamps.password}</p>
              )}
              {mode === "inscription" && !erreursChamps.password && (
                <p className="mt-1 text-xs text-muted-foreground">Minimum 6 caractères.</p>
              )}
            </label>

            {mode === "inscription" && (
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Confirmer le mot de passe</span>
                <input
                  type="password"
                  value={confirmation}
                  onChange={(e) => {
                    setConfirmation(e.target.value);
                    effacerErreurChamp("confirmation");
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={Boolean(erreursChamps.confirmation)}
                  className={classeChamp(Boolean(erreursChamps.confirmation))}
                />
                {erreursChamps.confirmation && (
                  <p className="mt-1 text-xs text-destructive">{erreursChamps.confirmation}</p>
                )}
              </label>
            )}

            {erreur && (
              <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">{erreur}</p>
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
                  onClick={() => changerMode("inscription")}
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
                  onClick={() => changerMode("connexion")}
                  className="text-accent hover:underline"
                >
                  Connectez-vous
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
