import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Itobe Entreprise" },
      {
        name: "description",
        content:
          "Itobe Entreprise réunit un média en ligne et une maison d'édition numérique pour créer, publier, diffuser et vendre des contenus de qualité.",
      },
      { property: "og:title", content: "À propos — Itobe Entreprise" },
      {
        property: "og:description",
        content: "Un écosystème numérique complet pour les médias et l'édition.",
      },
      { property: "og:url", content: "/a-propos" },
    ],
    links: [{ rel: "canonical", href: "/a-propos" }],
  }),
  component: APropos,
});

const piliers = [
  {
    t: "Portail média",
    d: "Actualités, articles, interviews et chroniques, avec catégories, tags, galeries, vidéos et newsletter.",
  },
  {
    t: "Maison d'édition",
    d: "Catalogue complet, gestion des formats PDF, EPUB et papier, promotions, stock et commandes.",
  },
  {
    t: "Reader intégré",
    d: "Lecture en ligne responsive, reprise automatique, table des matières, marque-pages et mode sombre.",
  },
  {
    t: "Bibliothèque personnelle",
    d: "Livres achetés, favoris, téléchargements et progression synchronisée entre appareils.",
  },
];

function APropos() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <p className="kicker">À propos</p>
      <h1 className="mt-3 text-4xl leading-tight md:text-5xl">
        Un écosystème unique pour le média et le livre.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        Itobe Entreprise a pour ambition de devenir un écosystème numérique complet, combinant un
        média en ligne et une maison d'édition digitale. Journalistes, auteurs, éditeurs et lecteurs
        y disposent d'un espace unique pour créer, publier, diffuser, vendre et consulter des
        contenus de qualité.
      </p>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {piliers.map((p) => (
          <div key={p.t} className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-display text-xl">{p.t}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 rule-top pt-10">
        <h2 className="text-2xl">Notre vision</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Grâce à son Reader intégré, sa bibliothèque numérique, son système de vente de livres et
          ses outils de gestion avancés, Itobe se positionne comme une solution moderne, évolutive
          et adaptée aux besoins des acteurs de l'édition et des médias.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/edition"
            className="rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Voir le catalogue
          </Link>
          <Link to="/contact" className="rounded-sm border border-border px-5 py-3 text-sm font-medium">
            Nous écrire
          </Link>
        </div>
      </section>
    </div>
  );
}
