import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArticleCover } from "@/components/article-cover";
import { ArticleHtmlBody } from "@/components/admin/article-rich-editor";
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
    <article className="mx-auto max-w-3xl px-4 py-14">
      <p className="kicker">{article.categorie}</p>
      <h1 className="mt-3 text-4xl leading-[1.1] md:text-5xl">{article.titre}</h1>
      <p className="mt-5 text-lg text-muted-foreground">{article.chapo}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {auteur && (
          <Link to="/auteurs/$slug" params={{ slug: auteur.slug }} className="hover:text-accent">
            {auteur.nom}
          </Link>
        )}
        <span>·</span>
        <span>{formatDate(article.date)}</span>
        <span>·</span>
        <span>{article.lecture} de lecture</span>
      </div>

      <div className="mt-8 aspect-[16/9] overflow-hidden rounded-sm">
        <ArticleCover src={article.couverture ?? article.image} alt={article.titre} />
      </div>

      <ArticleHtmlBody html={article.contenu} fallbackParagraphs={article.corps} />

      <div className="mt-10 flex flex-wrap gap-2">
        {article.tags.map((t: string) => (
          <span key={t} className="rounded-full border border-border px-3 py-1 text-xs">
            #{t}
          </span>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-border py-5 text-sm">
        <span className="text-muted-foreground">Partager :</span>
        {["Facebook", "X", "LinkedIn", "WhatsApp"].map((r) => (
          <button key={r} className="rounded-sm border border-border px-3 py-1.5 hover:bg-secondary">
            {r}
          </button>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl">Commentaires (2)</h2>
        <div className="mt-6 space-y-6">
          {[
            { n: "Jean K.", t: "Article très juste, surtout sur la question du modèle économique." },
            { n: "Sarah M.", t: "J'aimerais lire une suite sur la distribution en librairie." },
          ].map((c) => (
            <div key={c.n} className="rounded-sm border border-border bg-card p-4">
              <p className="text-sm font-medium">{c.n}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.t}</p>
            </div>
          ))}
        </div>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLFormElement).reset();
          }}
        >
          <textarea
            required
            rows={3}
            placeholder="Votre commentaire…"
            className="w-full rounded-sm border border-border bg-background p-3 text-sm outline-none focus:border-accent"
          />
          <button className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Publier
          </button>
        </form>
      </section>

      {suite.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl">À lire aussi</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {suite.map((a: PublicArticle) => (
              <Link key={a.slug} to="/media/$slug" params={{ slug: a.slug }} className="group">
                <div className="aspect-[16/10] overflow-hidden rounded-sm">
                  <ArticleCover src={a.couverture ?? a.image} alt={a.titre} />
                </div>
                <p className="mt-3 font-display leading-snug group-hover:text-accent">{a.titre}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
