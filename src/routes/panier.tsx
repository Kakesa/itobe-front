import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { usePanier } from "@/hooks/use-panier";
import { notifierBibliothequeMiseAJour } from "@/hooks/use-a-des-achats";
import { useSession } from "@/hooks/use-session";
import { getLivre, nomAuteur } from "@/lib/data";
import { getToken } from "@/lib/api-client";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Mon panier — Itobe Éditions" },
      { name: "description", content: "Consultez et finalisez vos achats de livres numériques Itobe." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanierPage,
});

type EtapeCheckout = "panier" | "paiement" | "traitement" | "confirme";

function PanierPage() {
  const navigate = useNavigate();
  const { connecte } = useSession();
  const {
    panier,
    loading,
    apiActif,
    mettreAJourQuantite,
    retirer,
    vider,
    checkout,
    checkoutEnCours,
  } = usePanier();

  const [etape, setEtape] = useState<EtapeCheckout>("panier");
  const [moyen, setMoyen] = useState<"mobile" | "carte">("mobile");
  const [operateur, setOperateur] = useState("M-Pesa");
  const [telephone, setTelephone] = useState("");
  const [erreur, setErreur] = useState("");
  const [commandesCreees, setCommandesCreees] = useState<number>(0);

  const items = panier.items;
  const vide = items.length === 0;

  const passerCommande = () => {
    if (!connecte || !getToken()) {
      void navigate({
        to: "/connexion",
        search: { redirect: "/panier" },
      });
      return;
    }
    setEtape("paiement");
  };

  const payer = async () => {
    setErreur("");
    setEtape("traitement");
    try {
      const result = await checkout({
        moyen: moyen === "mobile" ? "Mobile Money" : "Carte bancaire",
        operateur: moyen === "mobile" ? operateur : "Visa",
        ...(moyen === "mobile" && telephone ? { telephone } : {}),
      });
      setCommandesCreees(result?.count ?? result?.commandes?.length ?? 1);
      notifierBibliothequeMiseAJour();
      setEtape("confirme");
    } catch (err: unknown) {
      setEtape("paiement");
      setErreur(err instanceof Error ? err.message : "Le paiement a échoué.");
    }
  };

  if (etape === "confirme") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-display text-3xl text-accent">Paiement confirmé</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {commandesCreees > 1
            ? `${commandesCreees} commandes enregistrées. Vos livres sont dans votre bibliothèque.`
            : "Votre commande a été enregistrée. Le livre est disponible dans votre bibliothèque."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/bibliotheque"
            className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Ma bibliothèque
          </Link>
          <Link
            to="/commandes"
            className="rounded-sm border border-border px-5 py-2.5 text-sm"
          >
            Mes commandes
          </Link>
        </div>
      </div>
    );
  }

  if (etape === "traitement" || checkoutEnCours) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="mt-5 text-sm text-muted-foreground">Traitement du paiement…</p>
      </div>
    );
  }

  if (etape === "paiement") {
    const frais = moyen === "carte" ? 0.5 * items.length : 0.2 * items.length;
    return (
      <div className="mx-auto max-w-5xl px-4 py-14">
        <button
          type="button"
          onClick={() => setEtape("panier")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Retour au panier
        </button>
        <h1 className="mt-6 text-4xl">Finaliser la commande</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="text-xl">Moyen de paiement</h2>
            <div className="mt-5 space-y-3">
              {[
                { id: "mobile" as const, titre: "Mobile Money", aide: "M-Pesa, Orange Money, Airtel Money" },
                { id: "carte" as const, titre: "Carte bancaire", aide: "Visa, Mastercard" },
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

            {moyen === "mobile" && (
              <div className="mt-5 grid gap-4">
                <label className="block text-sm">
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
                <label className="block text-sm">
                  <span className="text-xs text-muted-foreground">Téléphone</span>
                  <input
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+243 …"
                    className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              </div>
            )}

            {erreur && (
              <p className="mt-4 rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {erreur}
              </p>
            )}

            <button
              type="button"
              onClick={() => void payer()}
              className="mt-6 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Payer {(panier.total + frais).toFixed(2)} $
            </button>
          </div>

          <aside className="rounded-sm border border-border bg-card p-6">
            <p className="kicker">Récapitulatif</p>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map((item) => (
                <li key={`${item.slug ?? item.livreId}-${item.format}`} className="flex justify-between gap-2">
                  <span className="truncate">{item.titre ?? item.slug}</span>
                  <span className="shrink-0">{(item.ligneTotal ?? item.prixUnitaire * item.quantity).toFixed(2)} $</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sous-total</dt>
                <dd>{panier.sousTotal.toFixed(2)} $</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Frais</dt>
                <dd>{frais.toFixed(2)} $</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>Total</dt>
                <dd>{(panier.total + frais).toFixed(2)} $</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <p className="kicker">Boutique</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Mon panier</h1>
      {!apiActif && connecte && (
        <p className="mt-3 text-sm text-muted-foreground">
          Mode local — connectez-vous via l&apos;API pour synchroniser votre panier.
        </p>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Chargement du panier…</p>
      ) : vide ? (
        <div className="mt-12 text-center">
          <ShoppingBag className="mx-auto size-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">Votre panier est vide.</p>
          <Link
            to="/edition"
            className="mt-6 inline-block rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
          >
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 space-y-4">
            {items.map((item) => {
              const slug = item.slug ?? "";
              const livreLocal = slug ? getLivre(slug) : undefined;
              const titre = item.titre ?? livreLocal?.titre ?? "Livre";
              const auteur =
                typeof item.auteur === "object"
                  ? item.auteur?.nom
                  : item.auteur ?? (livreLocal ? nomAuteur(livreLocal.auteur) : "");
              const key = item.livreId ?? slug;
              const couverture = livreLocal ?? (item.couverture || item.couleur ? {
                slug,
                titre,
                couverture: item.couverture ?? "",
                couleur: item.couleur ?? "",
                auteur: "",
                categorie: "",
                prix: item.prixUnitaire,
                formats: [],
                pages: 0,
                resume: "",
                isbn: "",
                langue: "",
                publication: "",
                disponible: true,
                chapitres: [],
                apercuPages: 0,
                apercuPourcent: 0,
                stock: 0,
              } : null);

              return (
                <li
                  key={`${key}-${item.format}`}
                  className="flex flex-wrap items-center gap-4 rounded-sm border border-border bg-card p-4"
                >
                  {couverture && (
                    <BookCover livre={couverture as Parameters<typeof BookCover>[0]["livre"]} className="w-16 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/edition/$slug"
                      params={{ slug: slug || "unknown" }}
                      className="font-display text-lg hover:text-accent"
                    >
                      {titre}
                    </Link>
                    {auteur && <p className="text-xs text-muted-foreground">{auteur}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{item.format}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Diminuer"
                      onClick={() =>
                        void mettreAJourQuantite({
                          livreIdOrSlug: String(item.livreId ?? slug),
                          quantity: item.quantity - 1,
                        })
                      }
                      className="grid size-8 place-items-center rounded-sm border border-border"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Augmenter"
                      onClick={() =>
                        void mettreAJourQuantite({
                          livreIdOrSlug: String(item.livreId ?? slug),
                          quantity: item.quantity + 1,
                        })
                      }
                      className="grid size-8 place-items-center rounded-sm border border-border"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <p className="font-display text-lg">
                    {(item.ligneTotal ?? item.prixUnitaire * item.quantity).toFixed(2)} $
                  </p>

                  <button
                    type="button"
                    aria-label="Retirer"
                    onClick={() => void retirer(String(item.livreId ?? slug))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <button
              type="button"
              onClick={() => void vider()}
              className="text-sm text-muted-foreground hover:text-destructive"
            >
              Vider le panier
            </button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-display text-3xl">{panier.total.toFixed(2)} $</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/edition"
              className="rounded-sm border border-border px-5 py-2.5 text-sm"
            >
              Continuer mes achats
            </Link>
            <button
              type="button"
              onClick={passerCommande}
              className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
            >
              Passer commande
            </button>
          </div>
        </>
      )}
    </div>
  );
}
