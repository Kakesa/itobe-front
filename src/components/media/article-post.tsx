import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { ArticleCover } from "@/components/article-cover";
import { AuthorAvatar } from "@/components/author-avatar";
import { ArticleSocialBar } from "@/components/media/article-social-bar";
import type { Article, Auteur } from "@/lib/data";
import { formatRelativeTimeAgo } from "@/lib/relative-time";

type ArticlePostCardProps = {
  article: Article;
  auteur?: Auteur | null;
  featured?: boolean;
  index?: number;
};

/** Carte fil d'actualités façon Bany Talks (LinkedIn-style). */
export function ArticlePostCard({
  article,
  auteur,
  featured = false,
  index = 0,
}: ArticlePostCardProps) {
  const auteurLabel = auteur?.nom ?? "Itobe Média";
  const auteurRole = auteur?.role ?? "Rédaction Itobe Média";
  const relTime = formatRelativeTimeAgo(article.date);

  return (
    <article
      className={`article-feed-card overflow-hidden border border-border bg-card shadow-sm ${
        featured ? "ring-1 ring-accent/25" : ""
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3 px-4 pb-2 pt-3">
        <Link
          to="/media/$slug"
          params={{ slug: article.slug }}
          className="shrink-0 overflow-hidden rounded-full"
          aria-label={auteurLabel}
        >
          <AuthorAvatar auteur={auteur} nom={auteurLabel} />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to="/media/$slug"
            params={{ slug: article.slug }}
            className="truncate text-[15px] font-semibold hover:underline"
          >
            {auteurLabel}
          </Link>
          <p className="mt-0.5 truncate text-[11px] leading-snug text-muted-foreground">
            {auteurRole}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <span>{article.categorie}</span>
            {relTime && (
              <>
                <span>·</span>
                <span>{relTime}</span>
              </>
            )}
          </div>
        </div>

        <Link
          to="/media/$slug"
          params={{ slug: article.slug }}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/60"
          aria-label="Voir l'article"
        >
          <MoreHorizontal className="size-5" />
        </Link>
      </div>

      {article.chapo && (
        <Link
          to="/media/$slug"
          params={{ slug: article.slug }}
          className="block w-full px-4 pb-3 text-left"
        >
          <p className="line-clamp-4 text-[15px] leading-relaxed text-foreground/85">
            {article.chapo}
          </p>
        </Link>
      )}

      <Link
        to="/media/$slug"
        params={{ slug: article.slug }}
        className="relative block aspect-video w-full overflow-hidden bg-muted"
      >
        <ArticleCover
          src={article.couverture ?? article.image}
          alt={article.titre}
          className="size-full object-cover"
        />
      </Link>

      <Link
        to="/media/$slug"
        params={{ slug: article.slug }}
        className="flex w-full items-center gap-3 border-t border-border bg-muted/40 px-4 py-3 text-left transition-colors hover:bg-muted/60"
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Itobe Média</p>
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug">{article.titre}</p>
          {article.chapo && (
            <p className="line-clamp-1 text-[13px] text-muted-foreground">{article.chapo}</p>
          )}
        </div>
        <span className="shrink-0 rounded-md bg-background px-3 py-2 text-[13px] font-semibold shadow-sm">
          Lire
        </span>
      </Link>

      <ArticleSocialBar
        slug={article.slug}
        titre={article.titre}
        chapo={article.chapo}
        commentairesCount={article.commentairesCount}
        className="border-0 border-t border-border"
      />
    </article>
  );
}
