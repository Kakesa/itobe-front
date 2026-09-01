import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock, UserRound } from "lucide-react";
import { useState } from "react";
import { ArticleCover } from "@/components/article-cover";
import { ArticleHtmlBody, richTextIsEmpty } from "@/components/admin/article-rich-editor";
import { ArticleSocialBar } from "@/components/media/article-social-bar";
import type { Auteur } from "@/lib/data";
import { formatDate } from "@/lib/data";
import { resolveMediaUrl } from "@/lib/media-url";
import type { PublicArticle } from "@/lib/public-data";

type ArticleBlogViewProps = {
  article: PublicArticle;
  auteur?: Auteur | null;
  prev?: PublicArticle | null;
  next?: PublicArticle | null;
};

function youtubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^&]+&)*v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match?.[1] ?? null;
}

function articleHasMainBody(article: PublicArticle): boolean {
  const contenu = article.contenu?.trim() ?? "";
  if (contenu && !richTextIsEmpty(contenu)) return true;
  return article.corps.some((p) => p.trim());
}

/** Fiche article — structure alignée sur Bany Talks (sans fond sombre). */
export function ArticleBlogView({ article, auteur, prev, next }: ArticleBlogViewProps) {
  const nomAuteur = auteur?.nom ?? "Itobe Média";
  const roleAuteur = auteur?.role ?? "Rédaction Itobe Média";
  const corps = article.corps.filter((p) => p.trim());
  const aCorps = articleHasMainBody(article);
  const galerie = (article.galerie ?? [])
    .map((src) => resolveMediaUrl(src))
    .filter(Boolean) as string[];
  const youtubeId = article.youtube ? youtubeVideoId(article.youtube) : null;
  const [commentsOpen, setCommentsOpen] = useState(false);

  return (
    <article className="article-detail">
      <Link
        to="/media"
        className="group mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        Retour au blog
      </Link>

      <header className="mb-8 space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="text-accent">{article.categorie}</span>
          <span>·</span>
          <time dateTime={article.date}>{formatDate(article.date)}</time>
        </div>
        <h1 className="font-display text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl">
          {article.titre}
        </h1>
      </header>

      {(article.couverture ?? article.image) && (
        <div className="aspect-video overflow-hidden border border-border bg-muted">
          <ArticleCover
            src={article.couverture ?? article.image}
            alt={article.titre}
            className="size-full object-cover"
          />
        </div>
      )}

      <ArticleSocialBar
        slug={article.slug}
        titre={article.titre}
        chapo={article.chapo}
        commentairesCount={article.commentairesCount}
        showComments
        commentsOpen={commentsOpen}
        onToggleComments={() => setCommentsOpen((v) => !v)}
        className={`mb-10 ${article.couverture ?? article.image ? "border-t-0" : ""}`}
      />

      {commentsOpen && (
        <div
          id="commentaires"
          className="mb-10 rounded-sm border border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground"
        >
          Les commentaires seront bientôt disponibles sur cette page.
        </div>
      )}

      <div className="mb-12 flex flex-wrap items-start gap-5 text-sm text-muted-foreground">
        <span className="inline-flex max-w-xl items-start gap-2">
          <UserRound className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {auteur ? (
              <Link
                to="/auteurs/$slug"
                params={{ slug: auteur.slug }}
                className="block font-medium text-foreground hover:text-accent"
              >
                {nomAuteur}
              </Link>
            ) : (
              <span className="block font-medium text-foreground">{nomAuteur}</span>
            )}
            <span className="mt-0.5 block text-xs leading-snug">{roleAuteur}</span>
          </span>
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock className="size-4 shrink-0" aria-hidden />
          {article.lecture} de lecture
        </span>
      </div>

      <div className="article-detail__body prose-blog">
        {aCorps ? (
          <ArticleHtmlBody html={article.contenu} fallbackParagraphs={corps} />
        ) : (
          <p className="text-muted-foreground italic">
            Le corps de l&apos;article sera bientôt disponible.
          </p>
        )}
      </div>

      {youtubeId && (
        <div className="mt-12 aspect-video overflow-hidden border border-border bg-muted">
          <iframe
            title={`Vidéo — ${article.titre}`}
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {galerie.length > 0 && (
        <section className="mt-12 space-y-4">
          <p className="kicker">Galerie</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {galerie.map((src) => (
              <figure
                key={src}
                className="flex min-h-[180px] items-center justify-center overflow-hidden border border-border bg-muted/30"
              >
                <img
                  src={src}
                  alt=""
                  className="max-h-[70vh] w-full object-contain"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </section>
      )}

      {article.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {(prev || next) && (
        <nav className="mt-14 grid grid-cols-1 gap-6 border-t border-border pt-10 sm:grid-cols-2">
          {prev ? (
            <Link
              to="/media/$slug"
              params={{ slug: prev.slug }}
              className="group space-y-2 text-left"
            >
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft className="size-3" />
                Article précédent
              </span>
              <p className="font-display leading-snug transition group-hover:text-accent">
                {prev.titre}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to="/media/$slug"
              params={{ slug: next.slug }}
              className="group space-y-2 text-left sm:text-right"
            >
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
                Article suivant
                <ArrowRight className="size-3" />
              </span>
              <p className="font-display leading-snug transition group-hover:text-accent">
                {next.titre}
              </p>
            </Link>
          ) : null}
        </nav>
      )}
    </article>
  );
}
