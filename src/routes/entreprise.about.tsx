/* eslint-disable prettier/prettier */
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/entreprise/about")({
  head: () => ({
    meta: [
      { title: "About — ITOBE Entreprises" },
      {
        name: "description",
        content:
          "ITOBE Entreprises est un groupe d'entreprises dédié à la création, à la production, à l'édition et à la diffusion de contenus qui mettent en lumière les cultures, les histoires, les talents et les imaginaires africains.",
      },
      { property: "og:title", content: "About — ITOBE Entreprises" },
      {
        property: "og:description",
        content:
          "Un écosystème qui accompagne les idées et les créateurs, de leur développement jusqu'à leur rencontre avec le public.",
      },
      { property: "og:url", content: "/entreprise/about" },
    ],
    links: [{ rel: "canonical", href: "/entreprise/about" }],
  }),
  component: EntrepriseAbout,
});

const fondateursFixes = [
  {
    index: "01",
    initiales: "CB",
    nom: "Christian Bigomukero",
    lieu: "Kinshasa",
    ton: "ink" as const,
    photo: "/images/entreprise/christian-bigomukero.png",
  },
  {
    index: "02",
    initiales: "CB",
    nom: "Christopher Bigo",
    lieu: "Kinshasa",
    ton: "warm" as const,
    photo: "/images/entreprise/christopher-bigo.jpg",
  },
];

function splitWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function SplitChars({
  text,
  delay = 0,
  charClass = "entreprise-about__char",
}: {
  text: string;
  delay?: number;
  charClass?: string;
}) {
  return (
    <>
      {Array.from(text).map((ch, i) =>
        ch === " " ? (
          <span key={i} className="entreprise-about__char-space" aria-hidden>
            {"\u00a0"}
          </span>
        ) : (
          <span key={`${ch}-${i}`} className="entreprise-about__char-wrap" aria-hidden>
            <span
              className={charClass}
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
          className="entreprise-about__word"
          style={
            {
              "--word-i": String(startIndex + i),
              "--word-count": String(total),
            } as CSSProperties
          }
        >
          {word}
          <span className="entreprise-about__word-mask" aria-hidden />
        </span>
      ))}
    </p>
  );
}

function EntrepriseAbout() {
  const { t } = useI18n();
  const g = t.groupe;
  const trackRef = useRef<HTMLDivElement>(null);
  const paragraphs = useMemo(() => [g.aboutP1, g.aboutP2, g.aboutP3], [g.aboutP1, g.aboutP2, g.aboutP3]);
  const wordCounts = useMemo(
    () => paragraphs.map((p) => splitWords(p).length),
    [paragraphs],
  );
  const totalWords = wordCounts.reduce((sum, n) => sum + n, 0);
  const fondateurs = [
    { ...fondateursFixes[0], role: g.christianRole, bio: g.christianBio, citation: g.christianQuote },
    { ...fondateursFixes[1], role: g.christopherRole, bio: g.christopherBio, citation: g.christopherQuote },
  ];
  const foundersRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      track.style.setProperty("--read-progress", "1");
      track.classList.add("entreprise-about--ready");
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const stickyH = Math.max(1, window.innerHeight);
      const range = Math.max(1, track.offsetHeight - stickyH);
      const scrolled = -rect.top;
      const progress = Math.min(1, Math.max(0, scrolled / range));
      track.style.setProperty("--read-progress", progress.toFixed(4));
      track.classList.toggle("entreprise-about--ready", progress >= 0.88);
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

  useEffect(() => {
    const root = foundersRef.current;
    if (!root) return;

    const heading = root.querySelector<HTMLElement>("[data-founders-heading]");
    const cards = [...root.querySelectorAll<HTMLElement>("[data-founder]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      root.classList.add("is-in");
      for (const card of cards) card.style.setProperty("--read-progress", "1");
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      if (heading && heading.getBoundingClientRect().top < vh * 0.86) {
        root.classList.add("is-in");
      }
      const atBottom = window.scrollY + vh >= document.documentElement.scrollHeight - 8;
      for (const card of cards) {
        const copy = card.querySelector<HTMLElement>(".groupe-founders__copy") ?? card;
        const first = copy.firstElementChild instanceof HTMLElement ? copy.firstElementChild : copy;
        const last = copy.lastElementChild instanceof HTMLElement ? copy.lastElementChild : copy;
        const firstTop = first.getBoundingClientRect().top;
        const lastRect = last.getBoundingClientRect();
        const textHeight = Math.max(1, lastRect.bottom - firstTop);
        const start = vh * 0.92;
        const end = vh - textHeight;
        let progress = (start - firstTop) / Math.max(1, start - end);
        if (atBottom && lastRect.bottom > 0 && firstTop < vh) progress = 1;
        card.style.setProperty("--read-progress", Math.min(1, Math.max(0, progress)).toFixed(4));
      }
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
    <>
      <div
        className="entreprise-about"
        ref={trackRef}
        style={{ "--read-progress": 0 } as CSSProperties}
      >
        <section className="entreprise-about__hero">
          <div className="entreprise-about__hero-inner">
            <h1 className="entreprise-about__title" aria-label={g.aboutTitle}>
              <SplitChars text={g.aboutTitle} delay={0.12} />
            </h1>
            {paragraphs.map((text, i) => (
              <SplitWords
                key={i}
                text={text}
                className="entreprise-about__lead"
                startIndex={wordCounts.slice(0, i).reduce((sum, n) => sum + n, 0)}
                total={totalWords}
              />
            ))}
            <Link to="/entreprise/contact" className="entreprise-about__cta">
              {g.aboutCta}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>

      <article
        ref={foundersRef}
        className="groupe-founders entreprise-about__founders px-4 pb-20 pt-16 md:px-8 md:pt-24"
      >
        <div className="entreprise-about__founders-inner">
          <section aria-labelledby="fondateurs-title">
            <header className="max-w-3xl" data-founders-heading>
              <h2
                id="fondateurs-title"
                className="founders-kicker text-[0.78rem] font-semibold uppercase tracking-brand text-muted-foreground"
                aria-label={g.foundersKicker}
              >
                <SplitChars text={g.foundersKicker} charClass="founders-kicker__char" />
              </h2>
            </header>

            <ol className="mt-12 space-y-14 md:mt-24 md:space-y-24">
              {fondateurs.map((f, i) => {
                const blocs = [f.role, f.bio, `« ${f.citation} »`];
                const counts = blocs.map((bloc) => splitWords(bloc).length);
                const total = counts.reduce((sum, n) => sum + n, 0);
                return (
                <li
                  key={f.nom}
                  data-founder
                  className={`groupe-founders__card groupe-founders__card--${f.ton} ${i % 2 === 1 ? "groupe-founders__card--reverse" : ""}`}
                >
                  <div
                    className={`groupe-founders__portrait groupe-founders__portrait--${f.ton}${f.photo ? " groupe-founders__portrait--photo" : ""}`}
                  >
                    {f.photo ? (
                      <img
                        src={f.photo}
                        alt={f.nom}
                        width={900}
                        height={1200}
                        className="groupe-founders__photo"
                      />
                    ) : null}
                    <span className="groupe-founders__mark" aria-hidden>
                      {f.initiales}
                    </span>
                    <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-8">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-brand opacity-70">
                        {f.index}
                      </p>
                      <div>
                        <p className="font-display text-2xl leading-tight sm:text-3xl md:text-4xl">
                          {f.nom}
                        </p>
                        <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-brand opacity-75">
                          {f.lieu}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="groupe-founders__copy flex flex-col justify-center py-1 md:py-4">
                    <SplitWords
                      text={blocs[0]}
                      className="text-[0.72rem] font-semibold uppercase tracking-brand text-muted-foreground"
                      startIndex={0}
                      total={total}
                    />
                    <SplitWords
                      text={blocs[1]}
                      className="mt-4 text-[0.98rem] leading-7 text-muted-foreground md:mt-5 md:text-[1.05rem] md:leading-8"
                      startIndex={counts[0]}
                      total={total}
                    />
                    <SplitWords
                      text={blocs[2]}
                      className="mt-5 font-display text-lg leading-snug italic text-foreground md:mt-6 md:text-2xl"
                      startIndex={counts[0] + counts[1]}
                      total={total}
                    />
                  </div>
                </li>
                );
              })}
            </ol>
          </section>
        </div>
      </article>
    </>
  );
}
