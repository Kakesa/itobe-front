import { ARTICLE_COVER_FALLBACK, resolveMediaUrl } from "@/lib/media-url";

type ArticleCoverProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export function ArticleCover({ src, alt = "", className = "" }: ArticleCoverProps) {
  const resolved = resolveMediaUrl(src);

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={alt}
        className={`size-full object-cover ${className}`.trim()}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`size-full bg-cover bg-center ${className}`.trim()}
      style={{ backgroundImage: ARTICLE_COVER_FALLBACK }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    />
  );
}
