import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Play, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { YoutubeApi } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/media/videos")({
  head: () => ({
    meta: [
      { title: "Vidéos — Neno | Itobe Média" },
      {
        name: "description",
        content:
          "Playlists Neno : Storytime, analyses et origines de la littérature africaine et congolaise.",
      },
      { property: "og:title", content: "Vidéos — Neno | Itobe Média" },
      { property: "og:url", content: "/media/videos" },
    ],
    links: [{ rel: "canonical", href: "/media/videos" }],
  }),
  component: MediaVideosPage,
});

interface YoutubeVideo {
  id: string;
  titre: string;
  description?: string;
  publishedAt?: string;
  thumbnail?: string;
  author?: string;
  url?: string;
  embedUrl?: string;
  playlistId?: string;
  playlistSlug?: string;
  playlistTitle?: string;
}

interface YoutubePlaylist {
  id: string;
  slug: string;
  title: string;
  url: string;
  count: number;
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function MediaVideosPage() {
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [playlists, setPlaylists] = useState<YoutubePlaylist[]>([]);
  const [channelUrl, setChannelUrl] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState("toutes");
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [active, setActive] = useState<YoutubeVideo | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      setLoading(true);
      setErreur(null);
      try {
        const res = await YoutubeApi.getVideos(50);
        if (annule) return;
        setVideos(res?.data ?? []);
        setPlaylists(res?.playlists ?? []);
        setChannelUrl(res?.channelUrl ?? null);
      } catch (e: any) {
        if (!annule) {
          setVideos([]);
          setPlaylists([]);
          setErreur(
            e?.message || "Impossible de charger les playlists YouTube Neno pour le moment.",
          );
        }
      } finally {
        if (!annule) setLoading(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const liste = useMemo(() => {
    if (playlist === "toutes") return videos;
    return videos.filter((v) => v.playlistSlug === playlist);
  }, [videos, playlist]);

  const playlistActive = playlists.find((p) => p.slug === playlist);
  const playlistUrl =
    playlist === "toutes" ? channelUrl : playlistActive?.url || channelUrl;

  return (
    <section className="media-dark-page media-videos-page py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-10 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="kicker mb-0">Neno</p>
            <h1 className="font-display text-3xl font-medium leading-tight sm:text-4xl">
              Vidéos
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Storytime, analyses et origines de la littérature — les playlists de la chaîne Neno.
            </p>
          </div>
          {playlistUrl && (
            <a
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              {playlist === "toutes" ? "Voir sur YouTube" : "Ouvrir la playlist"}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
        </header>

        {playlists.length > 0 && (
          <div className="media-blog-filters flex items-center gap-4 overflow-x-auto border-b border-border pb-2">
            <button
              type="button"
              onClick={() => setPlaylist("toutes")}
              className={`shrink-0 cursor-pointer whitespace-nowrap border-b-2 pb-2 text-sm transition ${
                playlist === "toutes"
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Toutes
            </button>
            {playlists.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlaylist(p.slug)}
                className={`shrink-0 cursor-pointer whitespace-nowrap border-b-2 pb-2 text-sm transition ${
                  playlist === p.slug
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-3 w-[30%]" />
              </div>
            ))}
          </div>
        )}

        {!loading && erreur && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="font-display text-xl">Vidéos temporairement indisponibles</p>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">{erreur}</p>
            <Link
              to="/media"
              className="mt-6 inline-flex rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground"
            >
              Voir les articles
            </Link>
          </div>
        )}

        {!loading && !erreur && liste.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-medium">Aucune vidéo pour le moment</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Les prochaines publications de cette playlist apparaîtront ici automatiquement.
            </p>
          </div>
        )}

        {!loading && !erreur && liste.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {liste.map((v) => (
              <button
                key={`${v.playlistId ?? "yt"}-${v.id}`}
                type="button"
                onClick={() => setActive(v)}
                className="media-videos-card group text-left"
              >
                <div className="media-videos-card__thumb">
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt="" loading="lazy" />
                  ) : (
                    <div className="size-full bg-secondary" />
                  )}
                  <span className="media-videos-card__play" aria-hidden>
                    <Play className="size-5 fill-current" />
                  </span>
                </div>
                <div className="mt-3 space-y-1 px-0.5">
                  {v.playlistTitle && playlist === "toutes" ? (
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent">
                      {v.playlistTitle}
                    </p>
                  ) : null}
                  <h2 className="line-clamp-2 font-display text-lg font-medium leading-snug transition-colors group-hover:text-accent">
                    {v.titre}
                  </h2>
                  {v.publishedAt && (
                    <p className="text-xs text-muted-foreground">{formatDate(v.publishedAt)}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="media-videos-modal"
          role="dialog"
          aria-modal="true"
          aria-label={active.titre}
          onClick={() => setActive(null)}
        >
          <div className="media-videos-modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                {active.playlistTitle ? (
                  <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent">
                    {active.playlistTitle}
                  </p>
                ) : null}
                <h3 className="truncate font-display text-base font-medium sm:text-lg">
                  {active.titre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-border hover:bg-secondary"
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="media-videos-modal__frame">
              <iframe
                src={`${active.embedUrl}?autoplay=1`}
                title={active.titre}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            {active.description && (
              <p className="line-clamp-4 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                {active.description}
              </p>
            )}
            {active.url && (
              <div className="border-t border-border px-4 py-3">
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                >
                  Ouvrir sur YouTube
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
