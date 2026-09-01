import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArticleCover } from "@/components/article-cover";
import { ArticleBlogView } from "@/components/media/article-blog-view";
import { articles, formatDate, getArticle, getAuteur, nomAuteur } from "@/lib/data";
import {
  fetchPublicArticleBySlug,
  normalizePublicArticle,
  type PublicArticle,
} from "@/lib/public-data";

export const Route = createFileRoute("/media/$slug")({
  loader: async ({ params }) => {
    const api = await fetchPublicArticleBySlug(params.slug);

    if (api.article) {
      return {
        article: api.article,
        suite: api.suite,
      };
    }

    const local = getArticle(params.slug);
    if (!local) throw notFound();

    return {
      article: normalizePublicArticle(local),
      suite: articles
        .filter((a) => a.slug !== params.slug)
        .slice(0, 3)
        .map((a) => normalizePublicArticle(a)),
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
  const { article, suite } = Route.useLoaderData();
  const auteur = getAuteur(article.auteur);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <Link to="/media" className="text-xs text-muted-foreground hover:text-accent">
        ← Retour aux articles
      </Link>

      <div className="mt-8">
        <ArticleBlogView article={article} auteur={auteur} />
      </div>

      {suite.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <p className="kicker">À lire aussi</p>
          <h2 className="mt-2 font-display text-2xl">Sur le même sujet</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {suite.map((a: PublicArticle) => (
              <Link key={a.slug} to="/media/$slug" params={{ slug: a.slug }} className="group">
                <div className="aspect-[16/10] overflow-hidden rounded-sm">
                  <ArticleCover src={a.couverture ?? a.image} alt={a.titre} />
                </div>
                <p className="kicker mt-4">{a.categorie}</p>
                <p className="mt-1 text-sm font-semibold leading-snug group-hover:text-accent">
                  {a.titre}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(a.date)} · {a.lecture}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
