import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, type CSSProperties } from "react";
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
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="media-about__word">
          {word}
          <span
            className="media-about__word-mask"
            style={{ animationDelay: `${delay + i * 0.04}s` } as CSSProperties}
            aria-hidden
          />
        </span>
      ))}
    </p>
  );
}

function AProposMedia() {
  const { locale, t } = useI18n();
  const a = t.mediaAbout;

  useEffect(() => {
    document.title = a.metaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", a.metaDescription);
  }, [a.metaTitle, a.metaDescription, locale]);

  return (
    <div className="media-about">
      <section className="media-about__hero">
        <div className="media-about__hero-inner">
          <p className="media-about__brand" aria-label="Neno">
            <SplitChars text="Neno" />
          </p>
          <h1 className="media-about__title" aria-label={a.heroTitle}>
            <SplitChars text={a.heroTitle} delay={0.12} />
          </h1>
          <SplitWords text={a.p1} className="media-about__lead" delay={0.55} />
          <SplitWords text={a.p2} className="media-about__lead" delay={1.35} />
          <SplitWords text={a.p3} className="media-about__lead" delay={2.15} />
          <Link to="/media" className="media-about__cta">
            {a.ctaBlog}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
