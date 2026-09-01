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

function Initiales({ nom }: { nom: string }) {
  const initiales = nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase())
    .join("");
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
      {initiales || "?"}
    </span>
  );
}

function ArticlePage() {
  const { article, suite } = Route.useLoaderData();
  const auteur = getAuteur(article.auteur);
  const [aime, setAime] = useState(false);
  const [suivi, setSuivi] = useState(false);

  const jaimes = 128 + (aime ? 1 : 0);
  const commentaires = [
    {
      n: "Jean K.",
      role: "Libraire à Kinshasa",
      t: "Article très juste, surtout sur la question du modèle économique.",
      date: "2 j",
    },
    {
      n: "Sarah M.",
      role: "Lectrice premium",
      t: "J'aimerais lire une suite sur la distribution en librairie.",
      date: "1 j",
    },
  ];

  return (
    <article className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      {/* Fil d'ariane discret */}
      <Link to="/media" className="text-xs text-muted-foreground hover:text-accent">
        ← Retour au fil Média
      </Link>

      {/* En-tête auteur façon LinkedIn */}
      <div className="mt-6 flex items-center gap-3">
        {auteur ? (
          <Link to="/auteurs/$slug" params={{ slug: auteur.slug }} aria-label={auteur.nom}>
            <Initiales nom={auteur.nom} />
          </Link>
        ) : (
          <Initiales nom="Itobe" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {auteur ? (
              <Link to="/auteurs/$slug" params={{ slug: auteur.slug }} className="hover:text-accent hover:underline">
                {auteur.nom}
              </Link>
            ) : (
              "Rédaction Itobe"
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">{article.categorie} · Itobe Média</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(article.date)} · {article.lecture} de lecture
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSuivi((s) => !s)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            suivi
              ? "border border-border text-muted-foreground"
              : "border border-accent text-accent hover:bg-accent/10"
          }`}
        >
          {suivi ? "Suivi ✓" : "+ Suivre"}
        </button>
      </div>

      {/* Titre et chapô */}
      <h1 className="mt-6 text-3xl leading-[1.15] font-bold md:text-4xl">{article.titre}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{article.chapo}</p>

      {/* Couverture */}
      <div className="mt-6 aspect-[16/9] overflow-hidden rounded-lg border border-border">
        <ArticleCover src={article.couverture ?? article.image} alt={article.titre} />
      </div>

      {/* Corps */}
      <div className="mt-8 text-[1.05rem] leading-relaxed">
        <ArticleHtmlBody html={article.contenu} fallbackParagraphs={article.corps} />
      </div>

      {/* Tags façon hashtags */}
      <div className="mt-8 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {article.tags.map((t: string) => (
          <span key={t} className="font-medium text-accent">
            #{t}
          </span>
        ))}
      </div>

      {/* Barre de réactions façon LinkedIn */}
      <div className="mt-8 border-y border-border py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            👍 {jaimes} · {commentaires.length} commentaires
          </span>
          <span>12 partages</span>
        </div>
        <div className="mt-2 flex divide-x divide-border border-t border-border pt-1">
          <button
            type="button"
            onClick={() => setAime((v) => !v)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors hover:bg-secondary ${
              aime ? "text-accent" : "text-muted-foreground"
            }`}
          >
            👍 {aime ? "Vous aimez" : "J'aime"}
          </button>
          <a
            href="#commentaires"
            className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            💬 Commenter
          </a>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            ↗ Partager
          </button>
        </div>
      </div>

      {/* Commentaires façon LinkedIn */}
      <section id="commentaires" className="mt-8 scroll-mt-20">
        <h2 className="text-lg font-semibold">Commentaires</h2>

        <form
          className="mt-4 flex items-start gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLFormElement).reset();
          }}
        >
          <Initiales nom="Vous" />
          <div className="flex-1">
            <textarea
              required
              rows={2}
              placeholder="Ajouter un commentaire…"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-accent"
            />
            <button className="mt-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
              Publier
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-5">
          {commentaires.map((c) => (
            <div key={c.n} className="flex items-start gap-3">
              <Initiales nom={c.n} />
              <div className="flex-1 rounded-lg rounded-tl-none bg-secondary/60 px-4 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">{c.n}</p>
                  <span className="text-xs text-muted-foreground">{c.date}</span>
                </div>
                <p className="text-xs text-muted-foreground">{c.role}</p>
                <p className="mt-1.5 text-sm leading-relaxed">{c.t}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* À lire aussi */}
      {suite.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold">À lire aussi sur Itobe Média</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {suite.map((a: PublicArticle) => (
              <Link key={a.slug} to="/media/$slug" params={{ slug: a.slug }} className="group">
                <div className="aspect-[16/10] overflow-hidden rounded-lg border border-border">
                  <ArticleCover src={a.couverture ?? a.image} alt={a.titre} />
                </div>
                <p className="mt-3 text-sm font-semibold leading-snug group-hover:text-accent">{a.titre}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
