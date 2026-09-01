import { useState, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  Globe,
  MessageCircle,
  Repeat2,
  Send,
  ThumbsUp,
} from "lucide-react";
import { ArticleCover } from "@/components/article-cover";
import type { Article, Auteur } from "@/lib/data";
import { formatRelativeTime } from "@/lib/relative-time";
import { resolveMediaUrl } from "@/lib/media-url";

function Initiales({ nom }: { nom: string }) {
  const initiales = nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase())
    .join("");

  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#0a66c2] text-sm font-semibold text-white">
      {initiales || "?"}
    </span>
  );
}

function AuthorAvatar({ auteur, nomFallback }: { auteur?: Auteur | null; nomFallback: string }) {
  const nom = auteur?.nom ?? nomFallback;
  const photo = resolveMediaUrl(auteur?.photo);

  if (photo) {
    return (
      <img
        src={photo}
        alt={nom}
        className="size-12 shrink-0 rounded-full object-cover"
      />
    );
  }

  return <Initiales nom={nom} />;
}

function PostHeader({
  auteur,
  categorie,
  date,
  lecture,
  suivi,
  onSuivi,
  linkAuthor = true,
}: {
  auteur?: Auteur | null;
  categorie: string;
  date: string;
  lecture: string;
  suivi?: boolean;
  onSuivi?: () => void;
  linkAuthor?: boolean;
}) {
  const nom = auteur?.nom ?? "Rédaction Itobe";
  const role = auteur?.role ?? `${categorie} · Itobe Média`;

  const avatar = <AuthorAvatar auteur={auteur} nomFallback={nom} />;
  const nameEl = linkAuthor && auteur ? (
    <Link to="/auteurs/$slug" params={{ slug: auteur.slug }} className="hover:text-[#0a66c2] hover:underline">
      {nom}
    </Link>
  ) : (
    nom
  );

  return (
    <div className="flex items-start gap-3 px-4 pt-4">
      {linkAuthor && auteur ? (
        <Link to="/auteurs/$slug" params={{ slug: auteur.slug }} aria-label={nom}>
          {avatar}
        </Link>
      ) : (
        avatar
      )}

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {nameEl}
        </p>
        <p className="truncate text-xs leading-snug text-muted-foreground">{role}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <span>{formatRelativeTime(date)}</span>
          <span>·</span>
          <span>{lecture}</span>
          <span>·</span>
          <Globe className="size-3" aria-hidden />
        </p>
      </div>

      {onSuivi && (
        <button
          type="button"
          onClick={onSuivi}
          className={`shrink-0 rounded-full border px-4 py-1 text-sm font-semibold transition-colors ${
            suivi
              ? "border-border text-muted-foreground hover:bg-secondary"
              : "border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/5"
          }`}
        >
          {suivi ? "Suivi ✓" : "+ Suivre"}
        </button>
      )}
    </div>
  );
}

function PostPreviewText({
  titre,
  chapo,
  maxLength = 280,
  onExpand,
}: {
  titre: string;
  chapo: string;
  maxLength?: number;
  onExpand?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const full = `${titre}\n\n${chapo}`.trim();
  const needsTruncate = full.length > maxLength && !expanded;

  const handleExpand = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(true);
    onExpand?.();
  };

  return (
    <div className="space-y-2 px-4 py-3 text-[15px] leading-relaxed text-foreground">
      <p className="font-semibold">{titre}</p>
      {needsTruncate ? (
        <p className="whitespace-pre-line">
          {chapo.slice(0, maxLength - titre.length - 4).trim()}…{" "}
          <button
            type="button"
            onClick={handleExpand}
            className="font-semibold text-muted-foreground hover:text-[#0a66c2] hover:underline"
          >
            plus
          </button>
        </p>
      ) : (
        <p className="whitespace-pre-line text-muted-foreground">{chapo}</p>
      )}
    </div>
  );
}

function ReactionSummary({ jaimes, commentCount, partages }: { jaimes: number; commentCount: number; partages: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-2 text-xs text-muted-foreground">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="flex shrink-0 -space-x-1">
          <span className="grid size-[18px] place-items-center rounded-full bg-[#0a66c2] text-[10px] text-white ring-2 ring-card">
            👍
          </span>
          <span className="grid size-[18px] place-items-center rounded-full bg-[#df704d] text-[10px] text-white ring-2 ring-card">
            ❤️
          </span>
          <span className="grid size-[18px] place-items-center rounded-full bg-[#7fc15e] text-[10px] text-white ring-2 ring-card">
            👏
          </span>
        </span>
        <span className="truncate">{jaimes.toLocaleString("fr-FR")}</span>
      </div>
      <div className="flex shrink-0 gap-2 sm:gap-3">
        <span className="whitespace-nowrap">{commentCount} com.</span>
        <span className="whitespace-nowrap">{partages} part.</span>
      </div>
    </div>
  );
}

function ActionBar({
  aime,
  onAime,
  onComment,
  commentHref,
}: {
  aime: boolean;
  onAime: () => void;
  onComment?: () => void;
  commentHref?: string;
}) {
  const btn =
    "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary sm:flex-row sm:gap-2 sm:py-3 sm:text-sm";

  return (
    <div className="border-t border-border px-1 py-1 sm:px-2">
      <div className="flex">
        <button
          type="button"
          onClick={onAime}
          className={`${btn} ${aime ? "text-[#0a66c2]" : ""}`}
        >
          <ThumbsUp className={`size-5 shrink-0 ${aime ? "fill-current" : ""}`} />
          <span className="truncate">{aime ? "Vous aimez" : "J'aime"}</span>
        </button>

        {commentHref ? (
          <a href={commentHref} className={btn}>
            <MessageCircle className="size-5 shrink-0" />
            <span className="truncate">Commenter</span>
          </a>
        ) : (
          <button type="button" onClick={onComment} className={btn}>
            <MessageCircle className="size-5 shrink-0" />
            <span className="truncate">Commenter</span>
          </button>
        )}

        <button type="button" className={btn}>
          <Repeat2 className="size-5 shrink-0" />
          <span className="truncate max-[380px]:hidden">Republier</span>
        </button>

        <button type="button" className={btn}>
          <Send className="size-5 shrink-0" />
          <span className="truncate">Envoyer</span>
        </button>
      </div>
    </div>
  );
}

type ArticlePostCardProps = {
  article: Article;
  auteur?: Auteur | null;
};

/** Carte fil d'actualités façon LinkedIn (liste /media). */
export function ArticlePostCard({ article, auteur }: ArticlePostCardProps) {
  const [aime, setAime] = useState(false);
  const jaimes = 128 + (aime ? 1 : 0);
  const commentCount = 2;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link to="/media/$slug" params={{ slug: article.slug }} className="block">
        <PostHeader
          auteur={auteur}
          categorie={article.categorie}
          date={article.date}
          lecture={article.lecture}
          linkAuthor={false}
        />

        <PostPreviewText titre={article.titre} chapo={article.chapo} />

        <div className="mx-0 overflow-hidden">
          <div className="aspect-[1.91/1] w-full">
            <ArticleCover src={article.couverture ?? article.image} alt={article.titre} />
          </div>
          <p className="border-t border-border bg-secondary/30 px-4 py-2 text-xs text-muted-foreground">
            {article.categorie} · {article.lecture} de lecture
          </p>
        </div>
      </Link>

      <ReactionSummary jaimes={jaimes} commentCount={commentCount} partages={12} />

      <ActionBar
        aime={aime}
        onAime={() => setAime((v) => !v)}
        commentHref={`/media/${article.slug}#commentaires`}
      />
    </article>
  );
}
