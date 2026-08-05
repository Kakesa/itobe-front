import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Download, Heart, ShoppingCart } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { formatDate, getAuteur, getLivre, livres, nomAuteur } from "@/lib/data";

export const Route = createFileRoute("/edition/$slug")({
  loader: ({ params }) => {
    const livre = getLivre(params.slug);
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
  const [panier, setPanier] = useState(false);
  const memeAuteur = livres.filter((l) => l.auteur === livre.auteur && l.slug !== livre.slug);

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
      <nav className="text-xs text-muted-foreground">
        <Link to="/edition" className="hover:text-foreground">
          Catalogue
        </Link>{" "}
        / <span>{livre.categorie}</span>
      </nav>

      <div className="mt-8 grid gap-12 md:grid-cols-[300px_1fr]">
        <div>
          <BookCover livre={livre} />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-sm opacity-60"
                style={{ backgroundImage: livre.couleur }}
              />
            ))}
          </div>
        </div>

        <div>
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
            <Link
              to="/achat/$slug"
              params={{ slug: livre.slug }}
              onClick={() => setPanier(true)}
              className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
            >
              <ShoppingCart className="size-4" />
              Acheter
            </Link>
            <Link
              to="/reader/$slug"
              params={{ slug: livre.slug }}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 text-sm font-medium"
            >
              <BookOpen className="size-4" /> Lire l'extrait gratuit
            </Link>
            <button
              onClick={() => setFavori((v) => !v)}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-3 text-sm"
            >
              <Heart className={`size-4 ${favori ? "fill-accent text-accent" : ""}`} />
              {favori ? "Favori" : "Ajouter aux favoris"}
            </button>
          </div>

          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Download className="size-3" /> Téléchargement PDF/EPUB inclus après achat · Paiement
            Mobile Money ou carte bancaire.
          </p>

          {/* Aperçu gratuit */}
          <div className="mt-10 rounded-sm border border-border bg-card p-5">
            <p className="kicker">Aperçu gratuit</p>
            <p className="mt-2 text-sm">
              {livre.apercuPages} pages accessibles librement, soit {livre.apercuPourcent} % de
              l'ouvrage.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {livre.chapitres.map((c: { titre: string; gratuit: boolean }) => (
                <li key={c.titre} className="flex items-center justify-between gap-4">
                  <span className={c.gratuit ? "" : "text-muted-foreground"}>{c.titre}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] ${
                      c.gratuit
                        ? "bg-accent/15 text-accent"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {c.gratuit ? "Gratuit" : "Verrouillé"}
                  </span>
                </li>
              ))}
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
            {memeAuteur.map((l) => (
              <Link key={l.slug} to="/edition/$slug" params={{ slug: l.slug }} className="group">
                <BookCover livre={l} className="transition-transform group-hover:-translate-y-1" />
                <p className="mt-3 font-display leading-snug group-hover:text-accent">{l.titre}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
