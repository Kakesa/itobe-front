import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Check, Download, Heart, ShoppingCart } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { BookCover, BookCoverThumb } from "@/components/book-cover";
import { useAccesLecture } from "@/hooks/use-acces-lecture";
import { usePanier } from "@/hooks/use-panier";
import { formatDate, fetchLivreBySlug, getAuteur, getLivre, livres, nomAuteur } from "@/lib/data";
import { formatParDefaut } from "@/lib/panier/guest-cart";

export const Route = createFileRoute("/edition/$slug")({
  loader: async ({ params }) => {
    const livre = (await fetchLivreBySlug(params.slug)) ?? getLivre(params.slug);
    if (!livre) throw notFound();
    return { livre };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Livre indisponible" }, { name: "robots", content: "noindex" }] };
    }
    const l = loaderData.livre;
    return {
      meta: [
        { title: `${l.titre} — ${nomAuteur(l.auteur)} | Éditions Itobe` },
        { name: "description", content: l.resume.slice(0, 155) },
        { property: "og:title", content: l.titre },
        { property: "og:description", content: l.resume.slice(0, 155) },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/edition/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/edition/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: l.titre,
            isbn: l.isbn,
            numberOfPages: l.pages,
            inLanguage: l.langue,
            author: { "@type": "Person", name: nomAuteur(l.auteur) },
            offers: {
              "@type": "Offer",
              price: l.promo ?? l.prix,
              priceCurrency: "USD",
              availability: l.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          }),
        },
      ],
    };
  },
  component: LivrePage,
});

function LivrePage() {
  const { livre } = Route.useLoaderData();
  const auteur = getAuteur(livre.auteur);
  const [favori, setFavori] = useState(false);
  const [ajoute, setAjoute] = useState(false);
  const [vueCouverture, setVueCouverture] = useState<"face" | "spine" | "edge">("face");
  const { ajouter, ajoutEnCours } = usePanier();
  const { accesComplet, dejaAchete } = useAccesLecture(livre.slug, livre.apercuPages);
  const accesSansAchat = accesComplet && !dejaAchete;
  const memeAuteur = livres.filter((l) => l.auteur === livre.auteur && l.slug !== livre.slug);

  const ajouterAuPanier = async () => {
    if (dejaAchete || accesComplet) return;
    await ajouter({
      slug: livre.slug,
      titre: livre.titre,
      quantity: 1,
      format: formatParDefaut(livre.formats),
      prixUnitaire: livre.promo ?? livre.prix,
    });
    setAjoute(true);
    setTimeout(() => setAjoute(false), 2000);
  };

  const fiche: [string, string][] = [
    ["ISBN", livre.isbn],
    ["Pages", String(livre.pages)],
    ["Langue", livre.langue],
    ["Catégorie", livre.categorie],
    ["Publication", formatDate(livre.publication)],
    ["Formats", livre.formats.join(", ")],
    ["Stock papier", livre.stock > 0 ? `${livre.stock} exemplaires` : "Numérique uniquement"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <nav className="text-xs text-muted-foreground animate-book-fade-up">
        <Link to="/edition" className="hover:text-foreground">
          Catalogue
        </Link>{" "}
        / <span>{livre.categorie}</span>
      </nav>

      <div className="mt-8 grid gap-12 md:grid-cols-[300px_1fr]">
        <div className="animate-book-fade-up md:sticky md:top-24 md:self-start" style={{ animationDelay: "100ms" }}>
          <div className="book-showcase mx-auto max-w-[300px]">
            <BookCover livre={livre} animated variant="reveal" realistic tilt={vueCouverture} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {(
              [
                { id: "face" as const, label: "Vue de face" },
                { id: "spine" as const, label: "Vue reliure" },
                { id: "edge" as const, label: "Vue tranche" },
              ] as const
            ).map((vue, i) => (
              <div
                key={vue.id}
                className="animate-book-fade-up"
                style={{ animationDelay: `${200 + i * 80}ms` }}
              >
                <BookCoverThumb
                  livre={livre}
                  active={vueCouverture === vue.id}
                  label={vue.label}
                  onClick={() => setVueCouverture(vue.id)}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[0.65rem] text-muted-foreground">
            Cliquez une miniature pour changer l&apos;angle
          </p>
        </div>

        <div className="animate-book-fade-up" style={{ animationDelay: "180ms" }}>
          <p className="kicker">{livre.categorie}</p>
          <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{livre.titre}</h1>
          {livre.sousTitre && (
            <p className="mt-2 text-lg text-muted-foreground">{livre.sousTitre}</p>
          )}
          {auteur && (
            <Link
              to="/auteurs/$slug"
              params={{ slug: auteur.slug }}
              className="mt-4 inline-block text-sm text-accent hover:underline"
            >
              par {auteur.nom}
            </Link>
          )}

          <p className="mt-6 max-w-2xl leading-relaxed">{livre.resume}</p>

          <div className="mt-8 flex items-end gap-4">
            <p className="font-display text-3xl">{(livre.promo ?? livre.prix).toFixed(2)} $</p>
            {livre.promo && (
              <p className="pb-1 text-muted-foreground line-through">{livre.prix.toFixed(2)} $</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {dejaAchete ? (
              <div className="w-full rounded-sm border border-accent/40 bg-accent/5 px-4 py-3 text-sm">
                <p className="font-medium text-accent">Vous avez déjà acheté ce livre.</p>
                <p className="mt-1 text-muted-foreground">
                  Retrouvez-le dans votre bibliothèque pour le lire ou le télécharger.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/reader/$slug"
                    params={{ slug: livre.slug }}
                    className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
                  >
                    <BookOpen className="size-4" />
                    Lire maintenant
                  </Link>
                  <Link
                    to="/bibliotheque"
                    className="inline-flex items-center rounded-sm border border-border px-4 py-2 text-sm"
                  >
                    Ma bibliothèque
                  </Link>
                </div>
              </div>
            ) : accesSansAchat ? (
              <div className="w-full rounded-sm border border-border bg-card px-4 py-3 text-sm">
                <p className="font-medium">Accès complet via votre abonnement Premium.</p>
                <Link
                  to="/reader/$slug"
                  params={{ slug: livre.slug }}
                  className="mt-3 inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
                >
                  <BookOpen className="size-4" />
                  Lire maintenant
                </Link>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled={ajoutEnCours || !livre.disponible || accesComplet}
                  onClick={() => void ajouterAuPanier()}
                  className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground disabled:opacity-50"
                >
                  {ajoute ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
                  {ajoute ? "Ajouté" : "Ajouter au panier"}
                </button>
                <Link
                  to="/achat/$slug"
                  params={{ slug: livre.slug }}
                  className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 text-sm font-medium"
                >
                  Acheter maintenant
                </Link>
              </>
            )}
            {!dejaAchete && !accesSansAchat && (
            <Link
              to="/reader/$slug"
              params={{ slug: livre.slug }}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 text-sm font-medium"
            >
              <BookOpen className="size-4" />
              {accesComplet ? "Lire maintenant" : "Lire l'extrait gratuit"}
            </Link>
            )}
            <button
              onClick={() => setFavori((v) => !v)}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-3 text-sm"
            >
              <Heart className={`size-4 ${favori ? "fill-accent text-accent" : ""}`} />
              {favori ? "Favori" : "Ajouter aux favoris"}
            </button>
          </div>

          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            {dejaAchete ? (
              <>
                <Download className="size-3" />
                Téléchargement PDF/EPUB disponible depuis votre bibliothèque.
              </>
            ) : (
              <>
                <Download className="size-3" /> Téléchargement PDF/EPUB inclus après achat · Paiement
                Mobile Money ou carte bancaire.
              </>
            )}
          </p>

          {/* Aperçu gratuit */}
          <div className="mt-10 rounded-sm border border-border bg-card p-5">
            <p className="kicker">{accesComplet ? "Votre ouvrage" : "Aperçu gratuit"}</p>
            <p className="mt-2 text-sm">
              {accesComplet
                ? "Vous avez accès à l'intégralité de cet ouvrage dans votre bibliothèque."
                : `${livre.apercuPages} pages accessibles librement, soit ${livre.apercuPourcent} % de l'ouvrage.`}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {livre.chapitres.map((c: { titre: string; gratuit: boolean }) => {
                const libre = accesComplet || c.gratuit;
                return (
                <li key={c.titre} className="flex items-center justify-between gap-4">
                  <span className={libre ? "" : "text-muted-foreground"}>{c.titre}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] ${
                      libre
                        ? "bg-accent/15 text-accent"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {libre ? (accesComplet ? "Inclus" : "Gratuit") : "Verrouillé"}
                  </span>
                </li>
                );
              })}
            </ul>
          </div>

          {/* Fiche technique */}
          <dl className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {fiche.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border pb-2 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {memeAuteur.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl">Du même auteur</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {memeAuteur.map((l, i) => (
              <BookCard key={l.slug} livre={l} index={i} showAuteur={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
