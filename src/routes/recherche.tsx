import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { articles, auteurs } from "@/lib/data";
import { useLivres } from "@/hooks/use-livres";

export const Route = createFileRoute("/recherche")({
  head: () => ({
    meta: [
      { title: "Recherche avancée — Articles, livres et auteurs | Itobe" },
      {
        name: "description",
        content:
          "Recherchez parmi les articles, les livres et les auteurs d'Itobe et filtrez par catégorie, format, prix ou popularité.",
      },
      { property: "og:title", content: "Recherche avancée | Itobe" },
      { property: "og:description", content: "Articles, livres, auteurs, catégories, mots-clés." },
      { property: "og:url", content: "/recherche" },
    ],
    links: [{ rel: "canonical", href: "/recherche" }],
  }),
  component: Recherche,
});

function Recherche() {
  const { livres } = useLivres();
  const [q, setQ] = useState("");
  const [type, setType] = useState("tout");
  const term = q.trim().toLowerCase();

  const resArticles = useMemo(
    () =>
      !term
        ? []
        : articles.filter(
            (a) =>
              a.titre.toLowerCase().includes(term) ||
              a.chapo.toLowerCase().includes(term) ||
              a.tags.some((t) => t.includes(term)) ||
              a.categorie.toLowerCase().includes(term),
          ),
    [term],
  );

  const resLivres = useMemo(
    () =>
      !term
        ? []
        : livres.filter(
            (l) =>
              l.titre.toLowerCase().includes(term) ||
              l.resume.toLowerCase().includes(term) ||
              l.categorie.toLowerCase().includes(term),
          ),
    [term, livres],
  );

  const resAuteurs = useMemo(
    () =>
      !term
        ? []
        : auteurs.filter(
            (a) => a.nom.toLowerCase().includes(term) || a.bio.toLowerCase().includes(term),
          ),
    [term],
  );

  const total = resArticles.length + resLivres.length + resAuteurs.length;
  const montrer = (t: string) => type === "tout" || type === t;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <p className="kicker">Recherche</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Trouver un contenu</h1>

      <div className="relative mt-8">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Articles, livres, auteurs, mots-clés…"
          className="w-full rounded-sm border border-border bg-card py-4 pl-12 pr-4 text-lg outline-none focus:border-accent"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["tout", "Tout"],
          ["articles", "Articles"],
          ["livres", "Livres"],
          ["auteurs", "Auteurs"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setType(id!)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              type === id
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {term && (
        <p className="mt-6 text-sm text-muted-foreground">
          {total} résultat{total > 1 ? "s" : ""} pour « {q} »
        </p>
      )}

      {montrer("articles") && resArticles.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl">Articles</h2>
          <ul className="mt-4 divide-y divide-border">
            {resArticles.map((a) => (
              <li key={a.slug} className="py-4">
                <Link
                  to="/media/$slug"
                  params={{ slug: a.slug }}
                  className="font-display text-lg hover:text-accent"
                >
                  {a.titre}
                </Link>
                <p className="text-sm text-muted-foreground">{a.chapo}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {montrer("livres") && resLivres.length > 0 && (
        <section className="mt-10 animate-book-fade-up">
          <h2 className="text-2xl">Livres</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {resLivres.map((l, i) => (
              <BookCard key={l.slug} livre={l} index={i} showPrix />
            ))}
          </div>
        </section>
      )}

      {montrer("auteurs") && resAuteurs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl">Auteurs</h2>
          <ul className="mt-4 divide-y divide-border">
            {resAuteurs.map((a) => (
              <li key={a.slug} className="py-4">
                <Link
                  to="/auteurs/$slug"
                  params={{ slug: a.slug }}
                  className="font-display text-lg hover:text-accent"
                >
                  {a.nom}
                </Link>
                <p className="text-sm text-muted-foreground">{a.role}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {term && total === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">Aucun résultat. Essayez un autre mot.</p>
      )}
    </div>
  );
}
