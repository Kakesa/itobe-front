/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { MaskedLine, Reveal } from "@/components/production/motion-reveal";
import { useProductionCopy } from "@/lib/production/copy";

export const Route = createFileRoute("/production/about")({
  head: () => ({
    meta: [
      { title: "About — Itobe Production" },
      {
        name: "description",
        content:
          "Meet Itobe Production, an independent studio built around artistic courage, cultural truth and meaningful collaboration.",
      },
      { property: "og:title", content: "About — Itobe Production" },
      { property: "og:url", content: "/production/about" },
    ],
    links: [{ rel: "canonical", href: "/production/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const t = useProductionCopy();
  return (
    <div className="page-shell">
      <section className="relative min-h-svh overflow-hidden bg-footer text-hero-foreground">
        <img
          src="/images/production/about-sunset-field.jpg"
          alt={t.about.crewAlt}
          width={1600}
          height={1067}
          fetchPriority="high"
          className="absolute inset-0 h-[108%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-footer/45" />
        <div className="relative mx-auto flex min-h-svh max-w-screen-2xl flex-col items-center justify-center px-5 py-32 text-center md:px-10 lg:px-14">
          <p className="inline-flex items-center gap-2.5 text-xs uppercase tracking-brand text-hero-muted">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            {t.about.kicker}
          </p>
          <h1 className="mt-8 max-w-4xl font-display text-[clamp(2.4rem,5.2vw,4.8rem)] leading-[0.98]">
            <MaskedLine delay={0.28}>{t.about.title}</MaskedLine>
            <MaskedLine delay={0.46} italic>
              {t.about.titleEm}
            </MaskedLine>
          </h1>
          <p className="prod-reveal mt-6 max-w-lg text-sm leading-7 text-hero-muted md:mt-8">{t.about.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-5 py-28 md:px-10 md:py-40 lg:px-14">
        <Reveal className="border-t border-border pt-12 text-center">
          <p className="font-display text-4xl md:text-6xl">{t.about.cta}</p>
          <Link to="/production/contact" className="mt-8 inline-flex items-center gap-2 text-xs uppercase">
            {t.about.talk} <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
