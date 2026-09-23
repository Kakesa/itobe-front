/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ArticleCover } from "@/components/article-cover";
import { ArticlePostCard } from "@/components/media/article-post";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticles } from "@/hooks/use-articles";
import { YoutubeApi } from "@/lib/api-client";
import { categoriesMedia, getAuteur } from "@/lib/data";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/media/")({
  head: () => ({
    meta: [
      { title: "Accueil — Neno | Itobe Média" },
      {
        name: "description",
        content:
          "Actualités, articles, interviews et chroniques — le portail média Itobe. Découvrez la une, les dernières publications et les vidéos Neno.",
      },
      { property: "og:title", content: "Accueil — Neno | Itobe Média" },
      {
        property: "og:description",
        content: "La rédaction Itobe : articles, interviews, chroniques et vidéos.",
      },
      { property: "og:url", content: "/media" },
    ],
    links: [{ rel: "canonical", href: "/media" }],
  }),
  component: MediaHomePage,
});

type YoutubeVideo = {
  id: string;
  titre: string;
  thumbnail?: string;
  playlistTitle?: string;
};

function MediaHomePage() {
  const { t } = useI18n();
  const { articles, loading } = useArticles();
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  const aLaUne = useMemo(() => {
    const featured = articles.filter((a) => a.populaire);
    if (featured.length > 0) return featured.slice(0, 1)[0];
    return articles[0] ?? null;
  }, [articles]);

  const recents = useMemo(() => {
    const exclude = aLaUne?.slug;
    return articles.filter((a) => a.slug !== exclude).slice(0, 6);
  }, [articles, aLaUne]);

  useEffect(() => {
    let annule = false;
    (async () => {
      setVideosLoading(true);
      try {
        const res = await YoutubeApi.getVideos(6);
        if (!annule) setVideos(res?.data ?? []);
      } catch {
        if (!annule) setVideos([]);
      } finally {
        if (!annule) setVideosLoading(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  return (
    <div className="media-dark-page media-home">
      <section className="media-home__hero">
        <div className="media-home__hero-inner">
          <p className="media-home__brand">Neno</p>
          <h1 className="media-home__title">
            Actualités, articles, interviews et chroniques
          </h1>
          <p className="media-home__lead">
            La rédaction Itobe explore la culture, la littérature et les idées
            africaines — en texte et en vidéo.
          </p>
          <div className="media-home__actions">
            <Link to="/media/articles" className="media-home__btn media-home__btn--primary">
              {t.nav.media.articles}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link to="/media/videos" className="media-home__btn media-home__btn--ghost">
              {t.nav.media.videos}
            </Link>
          </div>
        </div>
      </section>

      <div className="media-home__body mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6 lg:space-y-20 lg:px-8 lg:py-20">
        <section aria-labelledby="media-home-une">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="kicker mb-1">À la une</p>
              <h2 id="media-home-une" className="font-display text-2xl font-medium sm:text-3xl">
                Le dossier du moment
              </h2>
            </div>
            <Link
              to="/media/articles"
              className="hidden items-center gap-1.5 text-sm font-medium text-primary sm:inline-flex"
            >
              Tous les articles
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          {loading && <Skeleton className="aspect-[21/9] w-full rounded-sm" />}

          {!loading && aLaUne && (
            <Link
              to="/media/$slug"
              params={{ slug: aLaUne.slug }}
              className="media-home__feature group block overflow-hidden border border-border"
            >
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[20rem]">
                  <ArticleCover
                    src={aLaUne.couverture || aLaUne.image}
                    alt={aLaUne.titre}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center bg-card p-6 sm:p-8 lg:p-10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {aLaUne.categorie}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-snug sm:text-3xl">
                    {aLaUne.titre}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {aLaUne.chapo}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Lire l&apos;article
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {!loading && !aLaUne && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucun article pour le moment.
            </p>
          )}
        </section>

        <section aria-labelledby="media-home-recents">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="kicker mb-1">Publications</p>
              <h2 id="media-home-recents" className="font-display text-2xl font-medium sm:text-3xl">
                Derniers articles
              </h2>
            </div>
            <Link
              to="/media/articles"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary sm:hidden"
            >
              Voir tout
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          {loading && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="aspect-[4/5] w-full" />
            </div>
          )}

          {!loading && recents.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {recents.map((a, i) => (
                <ArticlePostCard
                  key={a.slug}
                  article={a}
                  auteur={getAuteur(a.auteur)}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="media-home-cats">
          <div className="mb-6">
            <p className="kicker mb-1">Rubriques</p>
            <h2 id="media-home-cats" className="font-display text-2xl font-medium sm:text-3xl">
              Explorer par catégorie
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoriesMedia.map((c) => (
              <Link key={c} to="/media/articles" className="media-home__chip">
                {c}
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="media-home-videos">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="kicker mb-1">Neno</p>
              <h2 id="media-home-videos" className="font-display text-2xl font-medium sm:text-3xl">
                Vidéos récentes
              </h2>
            </div>
            <Link
              to="/media/videos"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              {t.nav.media.videos}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          {videosLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="aspect-video w-full" />
            </div>
          )}

          {!videosLoading && videos.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.slice(0, 3).map((v) => (
                <Link
                  key={v.id}
                  to="/media/videos"
                  className="media-home__video group overflow-hidden border border-border bg-card"
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    {v.thumbnail ? (
                      <img
                        src={v.thumbnail}
                        alt=""
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Play className="size-5 fill-current" aria-hidden />
                      </span>
                    </span>
                  </div>
                  <div className="p-4">
                    {v.playlistTitle ? (
                      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {v.playlistTitle}
                      </p>
                    ) : null}
                    <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug">{v.titre}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!videosLoading && videos.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Les vidéos seront bientôt disponibles.
            </p>
          )}
        </section>

        <section className="media-home__about border-t border-border pt-12 text-center">
          <p className="kicker mb-3">{t.nav.media.aPropos}</p>
          <h2 className="mx-auto max-w-2xl font-display text-2xl font-medium leading-snug sm:text-3xl">
            Un voyage à travers les histoires remarquables de l&apos;Afrique
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Conversations, reportages et découvertes pour rendre la culture africaine
            plus accessible et captivante.
          </p>
          <Link to="/media/a-propos" className="media-home__btn media-home__btn--primary mt-8 inline-flex">
            {t.nav.media.aPropos}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  );
}
