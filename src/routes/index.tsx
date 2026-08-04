import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Newspaper } from "lucide-react";
import { articles, livres, formatDate, nomAuteur, prixAffiche } from "@/lib/data";
import { BookCover } from "@/components/book-cover";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Itobe — Média & maison d'édition numérique" },
      {
        name: "description",
        content:
          "Un écosystème unique pour lire l'actualité, découvrir des livres, acheter et lire en ligne. Média, catalogue, reader intégré et bibliothèque personnelle.",
      },
      { property: "og:title", content: "Itobe — Média & maison d'édition numérique" },
      {
        property: "og:description",
        content: "Lire l'actualité, découvrir des livres, lire en ligne. Un seul écosystème.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Accueil,
});

function Accueil() {
  const une = articles[0];
  const secondaires = articles.slice(1, 4);
  const aLaUne = livres.filter((l) => l.aLaUne)[0];
  const nouveautes = livres.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="paper-grain border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="kicker">Média · Maison d'édition</p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] md:text-6xl">
            Un lieu unique pour écrire l'actualité et publier des livres.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Itobe réunit un portail média et une maison d'édition numérique : articles, catalogue,
            lecture en ligne et bibliothèque personnelle.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/media"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              <Newspaper className="size-4" /> Lire le média
            </Link>
            <Link
              to="/edition"
              className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 text-sm font-medium"
            >
              <BookOpen className="size-4" /> Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Une */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl">À la une</h2>
          <Link to="/media" className="text-sm text-accent hover:underline">
            Tous les articles
          </Link>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Link to="/media/$slug" params={{ slug: une.slug }} className="group block">
            <div
              className="aspect-[16/9] w-full rounded-sm"
              style={{ backgroundImage: une.image }}
            />
            <p className="kicker mt-5">{une.categorie}</p>
            <h3 className="mt-2 text-3xl leading-tight group-hover:text-accent">{une.titre}</h3>
            <p className="mt-3 text-muted-foreground">{une.chapo}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              {nomAuteur(une.auteur)} · {formatDate(une.date)} · {une.lecture}
            </p>
          </Link>

          <div className="divide-y divide-border">
            {secondaires.map((a) => (
              <Link
                key={a.slug}
                to="/media/$slug"
                params={{ slug: a.slug }}
                className="group flex gap-4 py-5 first:pt-0"
              >
                <div
                  className="size-20 shrink-0 rounded-sm"
                  style={{ backgroundImage: a.image }}
                />
                <div>
                  <p className="kicker">{a.categorie}</p>
                  <p className="mt-1 font-display text-lg leading-snug group-hover:text-accent">
                    {a.titre}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(a.date)} · {a.lecture}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Livre mis en avant */}
      {aLaUne && (
        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[280px_1fr]">
            <BookCover livre={aLaUne} />
            <div>
              <p className="kicker">Mise en avant</p>
              <h2 className="mt-3 text-4xl leading-tight">{aLaUne.titre}</h2>
              <p className="mt-2 text-muted-foreground">{aLaUne.sousTitre}</p>
              <p className="mt-5 max-w-xl">{aLaUne.resume}</p>
              <p className="mt-6 font-display text-2xl">
                {prixAffiche(aLaUne)}
                {aLaUne.promo && (
                  <span className="ml-3 text-base text-muted-foreground line-through">
                    {aLaUne.prix.toFixed(2)} $
                  </span>
                )}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/edition/$slug"
                  params={{ slug: aLaUne.slug }}
                  className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
                >
                  Découvrir le livre <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/reader/$slug"
                  params={{ slug: aLaUne.slug }}
                  className="rounded-sm border border-border px-5 py-3 text-sm font-medium"
                >
                  Lire un extrait gratuit
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Nouveautés */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl">Nouveautés du catalogue</h2>
          <Link to="/edition" className="text-sm text-accent hover:underline">
            Tout le catalogue
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {nouveautes.map((l) => (
            <Link key={l.slug} to="/edition/$slug" params={{ slug: l.slug }} className="group">
              <BookCover livre={l} className="transition-transform group-hover:-translate-y-1" />
              <p className="mt-3 font-display leading-snug">{l.titre}</p>
              <p className="text-xs text-muted-foreground">{nomAuteur(l.auteur)}</p>
              <p className="mt-1 text-sm">{prixAffiche(l)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
