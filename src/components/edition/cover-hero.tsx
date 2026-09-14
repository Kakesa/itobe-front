import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BookCover } from "@/components/book-cover";
import { useI18n } from "@/i18n";
import type { Livre } from "@/lib/data";
import { nomAuteur } from "@/lib/data";

type CoverHeroProps = {
  livres: Livre[];
  loading: boolean;
};

function formatParution(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function EditionCoverHero({ livres, loading }: CoverHeroProps) {
  const { locale, t } = useI18n();
  const h = t.editionHome;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const recents = useMemo(
    () => [...livres].sort((a, b) => b.publication.localeCompare(a.publication)),
    [livres],
  );
  const une = useMemo(() => livres.filter((l) => l.aLaUne), [livres]);
  const featured = useMemo(() => {
    const base = une.length >= 2 ? une : recents;
    return base.slice(0, 8);
  }, [une, recents]);

  useEffect(() => {
    if (index >= featured.length) setIndex(0);
  }, [featured.length, index]);

  useEffect(() => {
    if (paused || featured.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [featured.length, paused]);

  const livre = featured[index];

  const go = (dir: -1 | 1) => {
    if (featured.length === 0) return;
    setIndex((i) => (i + dir + featured.length) % featured.length);
  };

  if (loading) {
    return (
      <section className="edition-cover-hero edition-cover-hero--loading" aria-hidden>
        <div className="edition-cover-hero__inner">
          <div className="edition-cover-hero__copy">
            <div className="h-4 w-24 animate-pulse bg-white/15" />
            <div className="mt-6 h-10 w-3/4 animate-pulse bg-white/15" />
            <div className="mt-4 h-4 w-1/2 animate-pulse bg-white/10" />
          </div>
          <div className="edition-cover-hero__stage">
            <div className="aspect-2/3 w-[min(16rem,58vw)] animate-pulse bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  if (!livre) return null;

  return (
    <section
      className="edition-cover-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="edition-cover-hero__wash"
        style={livre.couleur ? { backgroundImage: livre.couleur } : undefined}
        aria-hidden
      />
      <div className="edition-cover-hero__veil" aria-hidden />

      <div className="edition-cover-hero__inner">
        <div className="edition-cover-hero__copy">
          <p className="edition-cover-hero__badge">{h.heroBadge}</p>
          <p className="edition-cover-hero__genre">{livre.categorie}</p>
          <h1 className="edition-cover-hero__title">{livre.titre}</h1>
          <p className="edition-cover-hero__author">{nomAuteur(livre.auteur)}</p>
          <p className="edition-cover-hero__meta">
            {h.publishedLabel} : {formatParution(livre.publication, locale)}
            {livre.pages ? ` · ${livre.pages} ${h.pagesLabel}` : ""}
          </p>
          {livre.resume ? (
            <p className="edition-cover-hero__lead">
              {livre.resume.length > 180 ? `${livre.resume.slice(0, 177).trim()}…` : livre.resume}
            </p>
          ) : null}
          <Link
            to="/edition/$slug"
            params={{ slug: livre.slug }}
            className="edition-cover-hero__cta"
          >
            {h.heroLearnMore}
          </Link>
        </div>

        <div className="edition-cover-hero__stage">
          <div className="edition-cover-hero__book">
            <BookCover livre={livre} realistic animated tilt="face" />
          </div>
        </div>
      </div>

      {featured.length > 1 ? (
        <div className="edition-cover-hero__nav">
          <button type="button" className="edition-cover-hero__arrow" onClick={() => go(-1)} aria-label={h.prevBook}>
            <ChevronLeft className="size-5" />
          </button>
          <div className="edition-cover-hero__dots">
            {featured.map((item, i) => (
              <button
                key={item.slug}
                type="button"
                aria-label={item.titre}
                aria-current={i === index}
                className={`edition-cover-hero__dot ${i === index ? "is-active" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button type="button" className="edition-cover-hero__arrow" onClick={() => go(1)} aria-label={h.nextBook}>
            <ChevronRight className="size-5" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
