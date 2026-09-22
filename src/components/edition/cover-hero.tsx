/* eslint-disable prettier/prettier */
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { stripHtml } from "@/components/admin/article-rich-editor";
import { BookCover } from "@/components/book-cover";
import { useI18n } from "@/i18n";
import type { Livre } from "@/lib/data";

type CoverHeroProps = {
  livres: Livre[];
  loading: boolean;
};

const ANIM_MS = 980;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function HeroCopy({
  livre,
  badge,
  cta,
}: {
  livre: Livre;
  badge: string;
  cta: string;
}) {
  const lead = stripHtml(livre.resume ?? "");
  return (
    <>
      <p className="edition-cover-hero__badge">{badge}</p>
      <p className="edition-cover-hero__genre">{livre.categorie}</p>
      <h1 className="edition-cover-hero__title">{livre.titre}</h1>
      {lead ? (
        <p className="edition-cover-hero__lead">
          {lead.length > 180 ? `${lead.slice(0, 177).trim()}…` : lead}
        </p>
      ) : null}
      <Link to="/edition/$slug" params={{ slug: livre.slug }} className="edition-cover-hero__cta">
        {cta}
      </Link>
    </>
  );
}

function layerClass(kind: "enter" | "exit", dir: 1 | -1) {
  const way = dir === 1 ? "next" : "prev";
  return `is-${kind} is-${way}`;
}

export function EditionCoverHero({ livres, loading }: CoverHeroProps) {
  const { t } = useI18n();
  const h = t.editionHome;
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const locked = useRef(false);
  const indexRef = useRef(0);

  const recents = useMemo(
    () => [...livres].sort((a, b) => b.publication.localeCompare(a.publication)),
    [livres],
  );
  const une = useMemo(() => livres.filter((l) => l.aLaUne), [livres]);
  const featured = useMemo(() => {
    const base = une.length >= 2 ? une : recents;
    return base.slice(0, 8);
  }, [une, recents]);

  indexRef.current = index;

  useEffect(() => {
    if (index >= featured.length) setIndex(0);
  }, [featured.length, index]);

  const goTo = (next: number, direction: 1 | -1) => {
    if (featured.length < 2) return;
    const current = indexRef.current;
    const target = (next + featured.length) % featured.length;
    if (target === current) return;
    if (prefersReducedMotion()) {
      setPrevIndex(null);
      setIndex(target);
      return;
    }
    if (locked.current) return;
    locked.current = true;
    setDir(direction);
    setPrevIndex(current);
    setIndex(target);
  };

  useEffect(() => {
    if (prevIndex === null) return;
    const id = window.setTimeout(() => {
      setPrevIndex(null);
      locked.current = false;
    }, ANIM_MS);
    return () => window.clearTimeout(id);
  }, [index, prevIndex]);

  useEffect(() => {
    if (paused || featured.length < 2) return;
    const id = window.setInterval(() => {
      const i = indexRef.current;
      goTo(i + 1, 1);
    }, 6500);
    return () => window.clearInterval(id);
    // goTo reads featured from closure; restart if the list length changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featured.length, paused]);

  const livre = featured[index];
  const prevLivre = prevIndex !== null ? featured[prevIndex] : undefined;

  if (loading) {
    return (
      <section className="edition-cover-hero edition-cover-hero--loading" aria-hidden>
        <div className="edition-cover-hero__washes">
          <img
            src="/images/edition/hero.jpg"
            alt=""
            width={1080}
            height={1620}
            className="edition-cover-hero__bg"
          />
        </div>
        <div className="edition-cover-hero__veil" />
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

  const copyProps = {
    badge: h.heroBadge,
    cta: h.heroLearnMore,
  };

  return (
    <section
      className="edition-cover-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="edition-cover-hero__washes" aria-hidden>
        <img
          src="/images/edition/hero.jpg"
          alt=""
          width={1080}
          height={1620}
          fetchPriority="high"
          className="edition-cover-hero__bg"
        />
      </div>
      <div className="edition-cover-hero__veil" aria-hidden />

      <div className="edition-cover-hero__inner">
        <div className="edition-cover-hero__copy" aria-live="polite">
          {prevLivre ? (
            <div className={`edition-cover-hero__copy-layer ${layerClass("exit", dir)}`} aria-hidden>
              <HeroCopy livre={prevLivre} {...copyProps} />
            </div>
          ) : null}
          <div key={livre.slug} className={`edition-cover-hero__copy-layer ${layerClass("enter", dir)}`}>
            <HeroCopy livre={livre} {...copyProps} />
          </div>
        </div>

        <div className="edition-cover-hero__stage">
          {prevLivre ? (
            <div className="edition-cover-hero__book is-exit" aria-hidden>
              <div className={`edition-cover-hero__book-motion ${layerClass("exit", dir)}`}>
                <BookCover livre={prevLivre} />
              </div>
            </div>
          ) : null}
          <div key={livre.slug} className="edition-cover-hero__book">
            <div className={`edition-cover-hero__book-motion ${layerClass("enter", dir)}`}>
              <BookCover livre={livre} />
            </div>
          </div>
        </div>
      </div>

      {featured.length > 1 ? (
        <div className="edition-cover-hero__nav">
          <button
            type="button"
            className="edition-cover-hero__arrow"
            onClick={() => goTo(index - 1, -1)}
            aria-label={h.prevBook}
          >
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
                onClick={() => goTo(i, i > index ? 1 : -1)}
              />
            ))}
          </div>
          <button
            type="button"
            className="edition-cover-hero__arrow"
            onClick={() => goTo(index + 1, 1)}
            aria-label={h.nextBook}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
