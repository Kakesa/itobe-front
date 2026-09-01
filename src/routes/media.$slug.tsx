import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticlePostCard } from "@/components/media/article-post";
import { ArticleBlogView } from "@/components/media/article-blog-view";
import { articles, getArticle, getAuteur, nomAuteur } from "@/lib/data";
import {
  fetchPublicArticleBySlug,
  fetchPublicArticles,
  normalizePublicArticle,
  type PublicArticle,
} from "@/lib/public-data";

function sortArticles(list: PublicArticle[]): PublicArticle[] {
  return [...list].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export const Route = createFileRoute("/media/$slug")({
  loader: async ({ params }) => {
    const api = await fetchPublicArticleBySlug(params.slug);

    let article: PublicArticle | null = api.article;
    let suite = api.suite;

    if (!article) {
      const local = getArticle(params.slug);
      if (!local) throw notFound();
      article = normalizePublicArticle(local);
      suite = articles
        .filter((a) => a.slug !== params.slug)
        .slice(0, 3)
        .map((a) => normalizePublicArticle(a));
    }

    const allRaw =
      articles.length > 0
        ? articles.map((a) => normalizePublicArticle(a))
        : await fetchPublicArticles();
    const all = sortArticles(allRaw);
    const index = all.findIndex((a) => a.slug === params.slug);

    return {
      article,
      suite,
      prev: index > 0 ? (all[index - 1] ?? null) : null,
      next: index >= 0 && index < all.length - 1 ? (all[index + 1] ?? null) : null,
    };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article indisponible" }, { name: "robots", content: "noindex" }] };
    }
    const a = loaderData.article;
    return {
      meta: [
        { title: `${a.titre} | Itobe Média` },
        { name: "description", content: a.chapo },
        { property: "og:title", content: a.titre },
        { property: "og:description", content: a.chapo },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/media/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/media/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.titre,
            description: a.chapo,
            datePublished: a.date,
            author: { "@type": "Person", name: nomAuteur(a.auteur) },
          }),
        },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article, suite, prev, next } = Route.useLoaderData();
  const auteur = getAuteur(article.auteur);

  return (
    <div className="py-10 md:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ArticleBlogView article={article} auteur={auteur} prev={prev} next={next} />
      </div>

      {suite.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl border-t border-border px-4 pt-12 sm:px-6 lg:px-8">
          <p className="kicker mb-2">Continuer la lecture</p>
          <h2 className="font-display text-2xl font-medium">Articles similaires</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {suite.map((a, i) => (
              <ArticlePostCard
                key={a.slug}
                article={a}
                auteur={getAuteur(a.auteur)}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
