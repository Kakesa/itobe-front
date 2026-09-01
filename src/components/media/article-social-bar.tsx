import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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

type ArticleSocialBarProps = {
  slug: string;
  titre: string;
  chapo?: string;
  commentairesCount?: number;
  /** Sur la fiche détail, le bouton Commenter ouvre la zone #commentaires. */
  showComments?: boolean;
  onToggleComments?: () => void;
  commentsOpen?: boolean;
  className?: string;
};

export function ArticleSocialBar({
  slug,
  titre,
  chapo = "",
  commentairesCount = 0,
  showComments = false,
  onToggleComments,
  commentsOpen = false,
  className = "",
}: ArticleSocialBarProps) {
  const [liked, setLiked] = useState(() => readLikedSlugs().has(slug));
  const [likeCount, setLikeCount] = useState(liked ? 1 : 0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const isLiked = readLikedSlugs().has(slug);
    setLiked(isLiked);
    setLikeCount(isLiked ? 1 : 0);
  }, [slug]);

  const toggleLike = useCallback(() => {
    const slugs = readLikedSlugs();
    if (slugs.has(slug)) {
      slugs.delete(slug);
      setLiked(false);
      setLikeCount(0);
    } else {
      slugs.add(slug);
      setLiked(true);
      setLikeCount(1);
    }
    persistLikedSlugs(slugs);
  }, [slug]);

  const share = useCallback(async () => {
    const url = `${window.location.origin}/media/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: titre, text: chapo, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* annulé */
    }
  }, [chapo, slug, titre]);

  const commentAction = showComments ? (
    <button
      type="button"
      onClick={onToggleComments}
      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-semibold transition hover:bg-muted/60 sm:gap-2 sm:text-sm ${
        commentsOpen ? "text-accent" : "text-muted-foreground"
      }`}
    >
      <MessageCircle className="size-4 sm:size-[18px]" />
      Commenter
    </button>
  ) : (
    <Link
      to="/media/$slug"
      params={{ slug }}
      hash="commentaires"
      className="flex items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted/60 sm:gap-2 sm:text-sm"
    >
      <MessageCircle className="size-4 sm:size-[18px]" />
      Commenter
    </Link>
  );

  return (
    <div className={`border border-border bg-card ${className}`}>
      {(likeCount > 0 || commentairesCount > 0) && (
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] text-muted-foreground sm:px-4">
          {likeCount > 0 ? (
            <button
              type="button"
              onClick={toggleLike}
              className="inline-flex cursor-pointer items-center gap-1.5 hover:underline"
            >
              <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-accent">
                <Heart className="size-2.5 fill-white text-white" />
              </span>
              <span>{likeCount}</span>
            </button>
          ) : (
            <span />
          )}
          {commentairesCount > 0 &&
            (showComments ? (
              <button
                type="button"
                onClick={onToggleComments}
                className="cursor-pointer hover:underline"
              >
                {commentairesCount} commentaire{commentairesCount !== 1 ? "s" : ""}
              </button>
            ) : (
              <Link
                to="/media/$slug"
                params={{ slug }}
                hash="commentaires"
                className="hover:underline"
              >
                {commentairesCount} commentaire{commentairesCount !== 1 ? "s" : ""}
              </Link>
            ))}
        </div>
      )}

      <div
        className={`mx-1 grid grid-cols-3 sm:mx-2 ${
          likeCount > 0 || commentairesCount > 0 ? "border-t border-border" : ""
        }`}
      >
        <button
          type="button"
          onClick={toggleLike}
          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-semibold transition hover:bg-muted/60 sm:gap-2 sm:text-sm ${
            liked ? "text-accent" : "text-muted-foreground"
          }`}
        >
          <Heart className={`size-4 sm:size-[18px] ${liked ? "fill-accent" : ""}`} />
          J&apos;aime
        </button>
        {commentAction}
        <button
          type="button"
          onClick={() => void share()}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted/60 sm:gap-2 sm:text-sm"
        >
          <Share2 className="size-4 sm:size-[18px]" />
          {copied ? "Copié" : "Partager"}
        </button>
      </div>
    </div>
  );
}
