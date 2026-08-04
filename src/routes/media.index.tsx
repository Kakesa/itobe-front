import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { articles, categoriesMedia, formatDate, nomAuteur } from "@/lib/data";

export const Route = createFileRoute("/media/")({
  head: () => ({
    meta: [
      { title: "Média — Actualités, articles et interviews | Itobe" },
      {
        name: "description",
        content:
          "Actualités, chroniques, interviews et enquêtes culturelles. Le portail média d'Itobe, mis à jour chaque semaine.",
      },
      { property: "og:title", content: "Média — Actualités et articles | Itobe" },
      {
        property: "og:description",
        content: "Actualités, chroniques et interviews du portail média Itobe.",
      },
      { property: "og:url", content: "/media" },
    ],
    links: [{ rel: "canonical", href: "/media" }],
  }),
  component: MediaPage,
});

function MediaPage() {
  const [cat, setCat] = useState<string>("Tous");
  const liste = cat === "Tous" ? articles : articles.filter((a) => a.categorie === cat);
  const populaires = articles.filter((a) => a.populaire);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="kicker">Portail média</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Actualités & articles</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Enquêtes, chroniques et entretiens autour du livre, de la culture et des industries
        créatives.
      </p>

      <div className="mt-10 flex flex-wrap gap-2">
        {["Tous", ...categoriesMedia].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              cat === c
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-10 sm:grid-cols-2">
          {liste.map((a) => (
            <Link key={a.slug} to="/media/$slug" params={{ slug: a.slug }} className="group">
              <div className="aspect-[16/10] rounded-sm" style={{ backgroundImage: a.image }} />
              <p className="kicker mt-4">{a.categorie}</p>
              <h2 className="mt-1 text-xl leading-snug group-hover:text-accent">{a.titre}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{a.chapo}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {nomAuteur(a.auteur)} · {formatDate(a.date)} · {a.lecture}
              </p>
            </Link>
          ))}
          {liste.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun article dans cette catégorie.</p>
          )}
        </div>

        <aside>
          <p className="kicker">Les plus lus</p>
          <ol className="mt-4 space-y-5">
            {populaires.map((a, i) => (
              <li key={a.slug} className="flex gap-3">
                <span className="font-display text-2xl text-muted-foreground">{i + 1}</span>
                <Link
                  to="/media/$slug"
                  params={{ slug: a.slug }}
                  className="text-sm leading-snug hover:text-accent"
                >
                  {a.titre}
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-sm border border-border bg-card p-5">
            <p className="font-display text-lg">Newsletter</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Le meilleur de la rédaction, chaque vendredi.
            </p>
            <form
              className="mt-4 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLFormElement).reset();
              }}
            >
              <input
                type="email"
                required
                placeholder="votre@email.com"
                className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button className="w-full rounded-sm bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                S'abonner
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
