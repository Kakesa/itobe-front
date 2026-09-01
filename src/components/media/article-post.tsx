import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ArticleCover } from "@/components/article-cover";
import type { Article, Auteur } from "@/lib/data";
import { formatRelativeTimeAgo } from "@/lib/relative-time";
import { resolveMediaUrl } from "@/lib/media-url";

const LIKED_KEY = "itobe-liked-articles";

function readLikedSlugs(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function persistLikedSlugs(slugs: Set<string>) {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...slugs]));
}

function AuthorAvatar({
  auteur,
  nomFallback,
}: {
  auteur?: Auteur | null;
  nomFallback: string;
}) {
  const nom = auteur?.nom ?? nomFallback;
  const photo = resolveMediaUrl(auteur?.photo);

  if (photo) {
    return (
      <img
        src={photo}
        alt={nom}
        className="size-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  const initiales = nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase())
    .join("");

  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-stone-800 text-xs font-semibold text-stone-300">
      {initiales || "I"}
    </span>
  );
}

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
  const commentaires = article.commentairesCount ?? 0;

  const [liked, setLiked] = useState(() => readLikedSlugs().has(article.slug));
  const [likeCount, setLikeCount] = useState(liked ? 1 : 0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const isLiked = readLikedSlugs().has(article.slug);
    setLiked(isLiked);
    setLikeCount(isLiked ? 1 : 0);
  }, [article.slug]);

  const toggleLike = useCallback(() => {
    const slugs = readLikedSlugs();
    if (slugs.has(article.slug)) {
      slugs.delete(article.slug);
      setLiked(false);
      setLikeCount(0);
    } else {
      slugs.add(article.slug);
      setLiked(true);
      setLikeCount(1);
    }
    persistLikedSlugs(slugs);
  }, [article.slug]);

  const share = useCallback(async () => {
    const url = `${window.location.origin}/media/${article.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: article.titre, text: article.chapo, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* annulé ou indisponible */
    }
  }, [article.chapo, article.slug, article.titre]);

  return (
    <article
      className={`bany-feed-card overflow-hidden border border-white/5 bg-stone-900 ${
        featured ? "ring-1 ring-rose-500/20" : ""
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
          <AuthorAvatar auteur={auteur} nomFallback={auteurLabel} />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to="/media/$slug"
            params={{ slug: article.slug }}
            className="truncate text-[15px] font-semibold text-stone-100 hover:underline"
          >
            {auteurLabel}
          </Link>
          <p className="mt-0.5 truncate text-[11px] leading-snug text-stone-500">{auteurRole}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-stone-500">
            <span className="text-stone-400">{article.categorie}</span>
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
          className="rounded-full p-2 text-stone-500 transition-colors hover:bg-white/5"
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
          <p className="line-clamp-4 text-[15px] leading-relaxed text-stone-300">{article.chapo}</p>
        </Link>
      )}

      <Link
        to="/media/$slug"
        params={{ slug: article.slug }}
        className="relative block aspect-video w-full overflow-hidden bg-stone-850"
      >
        <ArticleCover
          src={article.couverture ?? article.image}
          alt={article.titre}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <Link
        to="/media/$slug"
        params={{ slug: article.slug }}
        className="flex w-full items-center gap-3 border-t border-white/5 bg-[#161616] px-4 py-3 text-left transition-colors hover:bg-[#1a1a1a]"
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-[11px] font-body uppercase tracking-wide text-stone-600">Itobe Média</p>
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-stone-100">
            {article.titre}
          </p>
          {article.chapo && (
            <p className="line-clamp-1 text-[13px] text-stone-500">{article.chapo}</p>
          )}
        </div>
        <span className="shrink-0 rounded-md bg-white/10 px-3 py-2 text-[13px] font-semibold text-stone-200">
          Lire
        </span>
      </Link>

      {(likeCount > 0 || commentaires > 0) && (
        <div className="flex items-center justify-between gap-3 border-t border-white/5 px-4 py-2.5 text-[13px] text-stone-500">
          {likeCount > 0 ? (
            <button
              type="button"
              onClick={toggleLike}
              className="inline-flex cursor-pointer items-center gap-1.5 hover:underline"
            >
              <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-rose-500">
                <Heart className="size-2.5 fill-white text-white" />
              </span>
              <span>{likeCount}</span>
            </button>
          ) : (
            <span />
          )}
          {commentaires > 0 && (
            <Link
              to="/media/$slug"
              params={{ slug: article.slug }}
              className="hover:underline"
            >
              {commentaires} commentaire{commentaires !== 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      <div className="mx-1 mb-1 grid grid-cols-3 border-t border-white/5 sm:mx-2">
        <button
          type="button"
          onClick={toggleLike}
          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-semibold transition hover:bg-white/5 sm:gap-2 sm:text-sm ${
            liked ? "text-rose-500" : "text-stone-500"
          }`}
        >
          <Heart className={`size-4 sm:size-[18px] ${liked ? "fill-rose-500" : ""}`} />
          J&apos;aime
        </button>
        <Link
          to="/media/$slug"
          params={{ slug: article.slug }}
          className="flex items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-semibold text-stone-500 transition hover:bg-white/5 sm:gap-2 sm:text-sm"
        >
          <MessageCircle className="size-4 sm:size-[18px]" />
          Commenter
        </Link>
        <button
          type="button"
          onClick={() => void share()}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-semibold text-stone-500 transition hover:bg-white/5 sm:gap-2 sm:text-sm"
        >
          <Share2 className="size-4 sm:size-[18px]" />
          {copied ? "Copié" : "Partager"}
        </button>
      </div>
    </article>
  );
}
