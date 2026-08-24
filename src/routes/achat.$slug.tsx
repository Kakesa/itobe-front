import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { BookCover } from "@/components/book-cover";
import { useSession } from "@/hooks/use-session";
import { CommandesApi, getToken } from "@/lib/api-client";
import { fetchLivreBySlug, getLivre, nomAuteur, type Livre } from "@/lib/data";
import { prixLivreFormat } from "@/lib/livre-prix";
import { notifierBibliothequeMiseAJour } from "@/hooks/use-a-des-achats";
import type { FormatLivre } from "@/lib/panier/types";

const searchSchema = z.object({
  format: z.enum(["numerique", "papier"]).optional(),
});

const LABELS_FORMAT_ACHAT: Record<"numerique" | "papier", string> = {
  numerique: "Numérique",
  papier: "Papier",
};

function formatAchatDepuisSearch(format?: "numerique" | "papier"): FormatLivre {
  return format === "papier" ? "Papier" : "EPUB + PDF";
}

export const Route = createFileRoute("/achat/$slug")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Paiement sécurisé — Mobile Money ou carte | Itobe" },
      {
        name: "description",
        content:
          "Réglez votre ouvrage par Mobile Money ou carte bancaire et retrouvez-le immédiatement dans votre bibliothèque numérique Itobe.",
      },
      { property: "og:title", content: "Paiement sécurisé | Itobe" },
      { property: "og:description", content: "Mobile Money et carte bancaire acceptés." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Achat,
});

type Etape = "moyen" | "details" | "traitement" | "confirme";

function Achat() {
  const { slug } = Route.useParams();
  const { format: formatAchat } = Route.useSearch();
  const navigate = useNavigate();
  const { connecte } = useSession();
  const [livre, setLivre] = useState<Livre | null>(() => getLivre(slug) ?? null);
  const [chargementLivre, setChargementLivre] = useState(!getLivre(slug));
  const [etape, setEtape] = useState<Etape>("moyen");
  const [moyen, setMoyen] = useState<"mobile" | "carte">("mobile");
  const [operateur, setOperateur] = useState("M-Pesa");
  const [telephone, setTelephone] = useState("");
  const [compte, setCompte] = useState(5);
  const [reference, setReference] = useState("");
  const [erreur, setErreur] = useState("");
  const formatCommande = formatAchatDepuisSearch(formatAchat);
  const libelleFormat = LABELS_FORMAT_ACHAT[formatAchat ?? "numerique"];

  useEffect(() => {
    if (livre) return;
    let annule = false;
    void fetchLivreBySlug(slug).then((l) => {
      if (!annule) {
        setLivre(l);
        setChargementLivre(false);
      }
    });
    return () => {
      annule = true;
    };
  }, [slug, livre]);

  useEffect(() => {
    if (connecte || !livre) return;
    void navigate({
      to: "/connexion",
      search: { redirect: `/achat/${slug}${formatAchat ? `?format=${formatAchat}` : ""}` },
    });
  }, [connecte, livre, navigate, slug, formatAchat]);

  useEffect(() => {
    if (etape !== "traitement") return;

    const token = getToken();
    if (!token || !livre) {
      const t = setTimeout(() => setEtape("confirme"), 1800);
      return () => clearTimeout(t);
    }

    let annule = false;
    (async () => {
      try {
        const res = await CommandesApi.create({
          livreSlugOrId: livre.slug,
          moyen: moyen === "mobile" ? "Mobile Money" : "Carte bancaire",
          format: formatCommande,
          operateur: moyen === "mobile" ? operateur : "Visa",
          ...(moyen === "mobile" && telephone ? { telephone } : {}),
        });
        const cmd = res?.data ?? res;
        if (!annule) {
          setReference(cmd?.reference ?? "");
          notifierBibliothequeMiseAJour();
          setEtape("confirme");
        }
      } catch (err: unknown) {
        if (!annule) {
          setErreur(err instanceof Error ? err.message : "Paiement échoué");
          setEtape("details");
        }
      }
    })();

    return () => {
      annule = true;
    };
  }, [etape, livre, moyen, operateur, telephone, formatCommande]);

  useEffect(() => {
    if (etape !== "confirme") return;
    const tick = setInterval(() => setCompte((c) => c - 1), 1000);
    const fin = setTimeout(() => navigate({ to: "/bibliotheque" }), 5000);
    return () => {
      clearInterval(tick);
      clearTimeout(fin);
    };
  }, [etape, navigate]);

  if (chargementLivre) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-muted-foreground">
        Chargement de l&apos;ouvrage…
      </div>
    );
  }

  if (!livre) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl">Ouvrage introuvable</h1>
        <Link to="/edition" className="mt-4 inline-block text-accent hover:underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const formatAchatType = formatAchat ?? "numerique";
  const prix = prixLivreFormat(livre, formatAchatType);
  const frais = moyen === "carte" ? 0.5 : 0.2;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="kicker">Paiement</p>
      <h1 className="mt-3 text-4xl">Finaliser votre achat</h1>

      <ol className="mt-8 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {["Moyen de paiement", "Coordonnées", "Confirmation"].map((s, i) => {
          const index = etape === "moyen" ? 0 : etape === "details" ? 1 : 2;
          return (
            <li key={s} className={i <= index ? "text-accent" : undefined}>
              {i + 1}. {s}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-sm border border-border bg-card p-6">
          {etape === "moyen" && (
            <>
              <h2 className="text-xl">Choisissez un moyen de paiement</h2>
              <div className="mt-5 space-y-3">
                {[
                  { id: "mobile" as const, titre: "Mobile Money", aide: "M-Pesa, Orange Money, Airtel Money" },
                  { id: "carte" as const, titre: "Carte bancaire", aide: "Visa, Mastercard — paiement 3D Secure" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMoyen(m.id)}
                    className={`flex w-full items-start gap-3 rounded-sm border p-4 text-left ${
                      moyen === m.id ? "border-accent bg-accent/5" : "border-border"
                    }`}
                  >
                    <span
                      className={`mt-1 size-3 rounded-full border ${
                        moyen === m.id ? "border-accent bg-accent" : "border-border"
                      }`}
                    />
                    <span>
                      <span className="block text-sm font-medium">{m.titre}</span>
                      <span className="block text-xs text-muted-foreground">{m.aide}</span>
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setEtape("details")}
                className="mt-6 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Continuer
              </button>
            </>
          )}

          {etape === "details" && (
            <>
              <h2 className="text-xl">
                {moyen === "mobile" ? "Paiement Mobile Money" : "Paiement par carte"}
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {moyen === "mobile" ? (
                  <>
                    <label className="block text-sm sm:col-span-2">
                      <span className="text-xs text-muted-foreground">Opérateur</span>
                      <select
                        value={operateur}
                        onChange={(e) => setOperateur(e.target.value)}
                        className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option>M-Pesa</option>
                        <option>Orange Money</option>
                        <option>Airtel Money</option>
                      </select>
                    </label>
                    <label className="block text-sm sm:col-span-2">
                      <span className="text-xs text-muted-foreground">Numéro de téléphone</span>
                      <input
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder="+243 …"
                        className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                    <p className="text-xs text-muted-foreground sm:col-span-2">
                      Vous recevrez une demande de confirmation sur votre téléphone.
                    </p>
                  </>
                ) : (
                  <>
                    <label className="block text-sm sm:col-span-2">
                      <span className="text-xs text-muted-foreground">Numéro de carte</span>
                      <input
                        placeholder="4242 4242 4242 4242"
                        className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="text-xs text-muted-foreground">Expiration</span>
                      <input
                        placeholder="MM/AA"
                        className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="text-xs text-muted-foreground">CVC</span>
                      <input
                        placeholder="123"
                        className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                  </>
                )}
              </div>
              {erreur && (
                <p className="mt-4 rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {erreur}
                </p>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEtape("moyen")}
                  className="rounded-sm border border-border px-5 py-2.5 text-sm"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => setEtape("traitement")}
                  className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Payer {(prix + frais).toFixed(2)} $
                </button>
              </div>
            </>
          )}

          {etape === "traitement" && (
            <div className="py-16 text-center">
              <div className="mx-auto size-8 animate-spin rounded-full border-2 border-border border-t-accent" />
              <p className="mt-5 text-sm text-muted-foreground">
                Traitement du paiement en cours…
              </p>
            </div>
          )}

          {etape === "confirme" && (
            <div className="py-12 text-center">
              <p className="font-display text-3xl text-accent">Paiement confirmé</p>
              <p className="mt-3 text-sm text-muted-foreground">
                « {livre.titre} » a été ajouté à votre bibliothèque.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Reçu envoyé par e-mail{reference ? ` — référence ${reference}` : ""}
              </p>
              <p className="mt-6 text-sm">
                Retour automatique vers votre bibliothèque dans {Math.max(compte, 0)} s
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/bibliotheque"
                  className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Aller à ma bibliothèque
                </Link>
                <Link
                  to="/reader/$slug"
                  params={{ slug: livre.slug }}
                  className="rounded-sm border border-border px-5 py-2.5 text-sm"
                >
                  Commencer la lecture
                </Link>
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-sm border border-border bg-card p-6">
          <p className="kicker">Récapitulatif</p>
          <div className="mt-4 flex gap-4">
            <BookCover livre={livre} className="w-20 shrink-0" />
            <div>
              <p className="font-display leading-snug">{livre.titre}</p>
              <p className="text-xs text-muted-foreground">{nomAuteur(livre.auteur)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{libelleFormat}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Ouvrage</dt>
              <dd>{prix.toFixed(2)} $</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frais de transaction</dt>
              <dd>{frais.toFixed(2)} $</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <dt>Total</dt>
              <dd>{(prix + frais).toFixed(2)} $</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
