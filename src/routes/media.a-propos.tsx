import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/media/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Neno" },
      {
        name: "description",
        content:
          "Neno est un voyage à travers les histoires remarquables de l’Afrique, les personnes qui ont façonné sa culture et les créations qui continuent d’influencer le continent et le monde.",
      },
      { property: "og:title", content: "À propos — Neno" },
      {
        property: "og:description",
        content:
          "Nous explorons l’Afrique à travers son histoire, sa littérature, son cinéma, ses innovations, sa musique et son art.",
      },
      { property: "og:url", content: "/media/a-propos" },
      { property: "og:image", content: "/images/a-propos/hero.jpg" },
    ],
    links: [{ rel: "canonical", href: "/media/a-propos" }],
  }),
  component: AProposMedia,
});

function splitWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function SplitChars({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {Array.from(text).map((ch, i) =>
        ch === " " ? (
          <span key={i} className="media-about__char-space" aria-hidden>
            {"\u00a0"}
          </span>
        ) : (
          <span key={`${ch}-${i}`} className="media-about__char-wrap" aria-hidden>
            <span
              className="media-about__char"
              style={{ animationDelay: `${delay + i * 0.055}s` } as CSSProperties}
            >
              {ch}
            </span>
          </span>
        ),
      )}
    </>
  );
}

function SplitWords({
  text,
  className,
  startIndex,
  total,
}: {
  text: string;
  className?: string;
  startIndex: number;
  total: number;
}) {
  const words = splitWords(text);
  return (
    <p className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="media-about__word"
          style={
            {
              "--word-i": String(startIndex + i),
              "--word-count": String(total),
            } as CSSProperties
          }
        >
          {word}
          <span className="media-about__word-mask" aria-hidden />
        </span>
      ))}
    </p>
  );
}

function AProposMedia() {
  const { locale, t } = useI18n();
  const a = t.mediaAbout;
  const trackRef = useRef<HTMLDivElement>(null);

  const paragraphs = useMemo(() => [a.p1, a.p2, a.p3], [a.p1, a.p2, a.p3]);
  const wordCounts = useMemo(
    () => paragraphs.map((p) => splitWords(p).length),
    [paragraphs],
  );
  const totalWords = wordCounts.reduce((sum, n) => sum + n, 0);

  useEffect(() => {
    document.title = a.metaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", a.metaDescription);
  }, [a.metaTitle, a.metaDescription, locale]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      track.style.setProperty("--read-progress", "1");
      track.classList.add("media-about--ready");
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const header = 64;
      const stickyH = Math.max(1, window.innerHeight - header);
      const range = Math.max(1, track.offsetHeight - stickyH);
      const scrolled = header - rect.top;
      const progress = Math.min(1, Math.max(0, scrolled / range));
      track.style.setProperty("--read-progress", progress.toFixed(4));
      track.classList.toggle("media-about--ready", progress >= 0.88);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="media-about" ref={trackRef} style={{ "--read-progress": 0 } as CSSProperties}>
      <section className="media-about__hero">
        <div className="media-about__hero-inner">
          <p className="media-about__brand" aria-label="Neno">
            <SplitChars text="Neno" />
          </p>
          <h1 className="media-about__title" aria-label={a.heroTitle}>
            <SplitChars text={a.heroTitle} delay={0.12} />
          </h1>
          {paragraphs.map((text, i) => (
            <SplitWords
              key={i}
              text={text}
              className="media-about__lead"
              startIndex={wordCounts.slice(0, i).reduce((sum, n) => sum + n, 0)}
              total={totalWords}
            />
          ))}
          <Link to="/media" className="media-about__cta">
            {a.ctaBlog}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
