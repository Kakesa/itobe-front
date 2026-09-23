/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/media/")({
  head: () => ({
    meta: [
      { title: "Accueil — Neno | Itobe Média" },
      {
        name: "description",
        content:
          "Actualités, articles, interviews et chroniques — le portail média Itobe.",
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

function MediaHomePage() {
  const { t } = useI18n();

  return (
    <div className="media-dark-page media-home">
      <section className="media-home__hero">
        <div className="media-home__hero-media" aria-hidden>
          <video
            className="media-home__hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={"/images/a-propos/hero.jpg"}
          >
            <source src="/videos/media-hero.mp4" type="video/mp4" />
            <source src="/videos/media-hero.webm" type="video/webm" />
          </video>
          <div className="media-home__hero-veil" />
        </div>
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
    </div>
  );
}
