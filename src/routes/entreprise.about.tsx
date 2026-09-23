import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";

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

const HERO_TITLE = "About";
const PARAGRAPHS = [
  "ITOBE Entreprises est un groupe d'entreprises dédié à la création, à la production, à l'édition et à la diffusion de contenus qui mettent en lumière les cultures, les histoires, les talents et les imaginaires africains.",
  "À travers nos différentes entités, nous construisons un écosystème qui accompagne les idées et les créateurs, de leur développement jusqu'à leur rencontre avec le public.",
  "Raconter l'Afrique, depuis l'Afrique, vers le monde.",
] as const;

const fondateurs = [
  {
    index: "01",
    initiales: "CB",
    nom: "Christian Bigomukero",
    role: "Fondateur · Média & édition",
    lieu: "Kinshasa",
    citation:
      "Un récit africain n'a pas besoin d'être traduit pour exister. Il a besoin d'un lieu où il peut durer.",
    bio: "Christian Bigomukero a conçu ITOBE comme un écosystème : le reportage, le livre et l'écran dans une même maison. Il porte la ligne éditoriale du groupe — des enquêtes de NENO aux collections d'Itobe Éditions.",
    ton: "ink" as const,
    photo: null as string | null,
  },
  {
    index: "02",
    initiales: "CB",
    nom: "Christopher Bigo",
    role: "Fondateur · Vision & production",
    lieu: "Kinshasa",
    citation:
      "Le cinéma, le livre et la presse ne sont pas des silos. Ce sont trois portes vers la même mémoire.",
    bio: "Christopher Bigo a impulsé ITOBE Entreprises comme plateforme de groupe : un cadre pour que le média, l'édition et la production se parlent. Il veille à la vision d'ensemble et aux projets qui traversent les trois univers.",
    ton: "warm" as const,
    photo: "/images/entreprise/christopher-bigo.jpg",
  },
];

function splitWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function SplitChars({ text, delay = 0 }: { text: string; delay?: number }) {
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
              className="entreprise-about__char"
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
  const trackRef = useRef<HTMLDivElement>(null);

  const paragraphs = useMemo(() => [...PARAGRAPHS], []);
  const wordCounts = useMemo(
    () => paragraphs.map((p) => splitWords(p).length),
    [paragraphs],
  );
  const totalWords = wordCounts.reduce((sum, n) => sum + n, 0);

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

  return (
    <>
      <div
        className="entreprise-about"
        ref={trackRef}
        style={{ "--read-progress": 0 } as CSSProperties}
      >
        <section className="entreprise-about__hero">
          <div className="entreprise-about__hero-inner">
            <p className="entreprise-about__brand" aria-label="ITOBE">
              <SplitChars text="ITOBE" />
            </p>
            <h1 className="entreprise-about__title" aria-label={HERO_TITLE}>
              <SplitChars text={HERO_TITLE} delay={0.12} />
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
              Contactez-nous
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>

      <article className="groupe-founders entreprise-about__founders px-4 pb-20 pt-16 md:px-8 md:pt-24">
        <div className="entreprise-about__founders-inner">
          <section aria-labelledby="fondateurs-title">
            <header className="max-w-3xl">
              <p className="text-[0.78rem] font-semibold uppercase tracking-brand text-muted-foreground">
                Fondateurs
              </p>
              <h2
                id="fondateurs-title"
                className="mt-3 font-display text-4xl leading-[1.12] md:text-6xl"
              >
                Les voix à l&apos;origine.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                ITOBE Entreprises naît d&apos;une conviction simple : les récits africains méritent
                une maison capable de les porter en articles, en livres et à l&apos;écran — sans les
                diluer.
              </p>
            </header>

            <ol className="mt-12 space-y-14 md:mt-24 md:space-y-24">
              {fondateurs.map((f, i) => (
                <li
                  key={f.nom}
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
                  <div className="flex flex-col justify-center py-1 md:py-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-brand text-muted-foreground">
                      {f.role}
                    </p>
                    <p className="mt-4 text-[0.98rem] leading-7 text-muted-foreground md:mt-5 md:text-[1.05rem] md:leading-8">
                      {f.bio}
                    </p>
                    <p className="mt-5 font-display text-lg leading-snug italic text-foreground md:mt-6 md:text-2xl">
                      « {f.citation} »
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </article>
    </>
  );
}
