import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArticlePostCard } from "@/components/media/article-post";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticles } from "@/hooks/use-articles";
import { categoriesMedia, getAuteur } from "@/lib/data";

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

function FeedSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex gap-3 p-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2 px-4 pb-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="aspect-[1.91/1] w-full rounded-none" />
      <Skeleton className="mx-4 my-3 h-8 w-full" />
    </div>
  );
}

function MediaPage() {
  const { articles, loading } = useArticles();
  const [cat, setCat] = useState<string>("Tous");

  const liste = useMemo(
    () => (cat === "Tous" ? articles : articles.filter((a) => a.categorie === cat)),
    [articles, cat],
  );
  const populaires = useMemo(() => articles.filter((a) => a.populaire), [articles]);

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
            type="button"
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
        <div className="grid gap-8 sm:grid-cols-2">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <FeedSkeleton key={i} />
            ))}

          {!loading &&
            liste.map((a) => (
              <ArticlePostCard key={a.slug} article={a} auteur={getAuteur(a.auteur)} />
            ))}

          {!loading && liste.length === 0 && (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              Aucun article publié pour le moment.
            </p>
          )}
        </div>

        <aside>
          <p className="kicker">Les plus lus</p>
          <ol className="mt-4 space-y-5">
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-6" />
                  <Skeleton className="h-4 flex-1" />
                </li>
              ))}
            {!loading &&
              populaires.map((a, i) => (
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
                S&apos;abonner
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
