import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ArticlePostCard } from "@/components/media/article-post";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticles } from "@/hooks/use-articles";
import { categoriesMedia, getAuteur } from "@/lib/data";

export const Route = createFileRoute("/media/")({
  head: () => ({
    meta: [
      { title: "Blog — Actualités, articles et interviews | Itobe" },
      {
        name: "description",
        content:
          "Analyses, chroniques et entretiens autour du livre, de la culture et des industries créatives.",
      },
      { property: "og:title", content: "Blog — Itobe Média" },
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
    <div className="animate-pulse overflow-hidden border border-border bg-card">
      <div className="flex items-center gap-3 px-4 pb-2 pt-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-40" />
        </div>
      </div>
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

function MediaPage() {
  const { articles, loading } = useArticles();
  const [cat, setCat] = useState<string>("Tous");
  const [query, setQuery] = useState("");

  const liste = useMemo(() => {
    let items = cat === "Tous" ? articles : articles.filter((a) => a.categorie === cat);

    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((a) => {
      const auteurNom = getAuteur(a.auteur)?.nom ?? "";
      return (
        a.titre.toLowerCase().includes(q) ||
        a.chapo.toLowerCase().includes(q) ||
        a.categorie.toLowerCase().includes(q) ||
        auteurNom.toLowerCase().includes(q) ||
        a.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [articles, cat, query]);

  const { une, publications } = useMemo(() => {
    const featured = liste.filter((a) => a.populaire);
    const featuredList = featured.length > 0 ? featured : liste.length > 0 ? [liste[0]] : [];
    const slugs = new Set(featuredList.map((a) => a.slug));
    const rest = liste.filter((a) => !slugs.has(a.slug));
    return { une: featuredList, publications: rest };
  }, [liste]);

  const filterOptions = ["Tous", ...categoriesMedia];

  return (
    <section id="blog-section" className="media-blog-page py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-10 lg:px-8">
        <header className="space-y-2">
          <p className="kicker mb-0">Itobe Média</p>
          <h1 className="font-display text-3xl font-medium leading-tight sm:text-4xl">Blog</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Analyses, chroniques et coulisses — le prolongement écrit des conversations Itobe.
          </p>
        </header>

        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre, catégorie, auteur, mot-clé…"
              className="w-full border-b border-border bg-transparent py-2 pl-7 pr-4 text-sm transition focus:border-accent/50 focus:outline-none"
            />
          </div>

          <div className="media-blog-filters flex items-center gap-4 overflow-x-auto border-b border-border pb-2">
            {filterOptions.map((c) => {
              const active = cat === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`shrink-0 cursor-pointer whitespace-nowrap border-b-2 pb-2 text-sm transition ${
                    active
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <FeedSkeleton />
            <FeedSkeleton />
            <FeedSkeleton />
          </div>
        )}

        {!loading && liste.length === 0 && (
          <div className="space-y-2 py-12 text-center">
            <p className="font-display text-xl text-muted-foreground">Aucun article trouvé</p>
            <p className="text-sm text-muted-foreground">
              Essayez un autre mot-clé ou une autre catégorie.
            </p>
          </div>
        )}

        {!loading && une.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-medium">À la une</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {une.map((a, i) => (
                <div key={a.slug} className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
                  <ArticlePostCard
                    article={a}
                    auteur={getAuteur(a.auteur)}
                    featured={i === 0}
                    index={i}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && publications.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-medium">Publications</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {publications.map((a, i) => (
                <ArticlePostCard
                  key={a.slug}
                  article={a}
                  auteur={getAuteur(a.auteur)}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        <section className="media-blog-newsletter mx-auto max-w-3xl border-t border-border pt-12 text-center">
          <p className="kicker mb-4">Newsletter</p>
          <h2 className="mb-3 font-display text-3xl font-medium leading-tight sm:text-4xl">
            Recevez les nouveaux articles
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
            Culture, édition et coulisses d&apos;Itobe — directement dans votre boîte mail.
          </p>
          <form
            className="mx-auto max-w-lg space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              (e.currentTarget as HTMLFormElement).reset();
            }}
          >
            <div className="flex flex-col gap-0 border-b border-border transition focus-within:border-accent/50 sm:flex-row">
              <input
                type="email"
                required
                placeholder="Votre adresse email"
                className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="flex shrink-0 cursor-pointer items-center justify-center gap-2 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-90"
              >
                S&apos;abonner
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Pas de spam. Seulement du contenu utile. Désabonnement à tout moment.
            </p>
          </form>
        </section>
      </div>
    </section>
  );
}
