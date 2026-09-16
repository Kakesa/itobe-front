/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/production/motion-reveal";
import { useProductionCopy } from "@/lib/production/copy";

export const Route = createFileRoute("/production/")({
  head: () => ({
    meta: [
      { title: "Itobe Production — Stories Without Borders" },
      {
        name: "description",
        content:
          "Itobe Production creates bold, meaningful films, series and documentaries rooted in Africa and made for the world.",
      },
      { property: "og:title", content: "Itobe Production — Stories Without Borders" },
      {
        property: "og:description",
        content: "Independent stories, made with purpose. Discover Itobe Production.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/production" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/production" }],
  }),
  component: ProductionHome,
});

function ProductionHome() {
  const t = useProductionCopy();
  return (
    <div>
      <section className="relative h-svh min-h-svh overflow-hidden bg-footer text-hero-foreground">
        <img
          src="/images/production/hero-crew-dusk.jpg"
          alt={t.home.heroAlt}
          width={1920}
          height={1088}
          fetchPriority="high"
          className="absolute inset-0 h-[108%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex h-full min-h-svh max-w-screen-2xl flex-col justify-end px-5 pb-10 pt-32 text-center md:px-10 md:pb-14 md:text-left lg:px-14">
          <div className="prod-reveal">
            <p className="mb-5 text-xs uppercase text-hero-muted">{t.home.kicker}</p>
            <h1 className="mx-auto max-w-5xl font-display text-[clamp(4rem,11vw,10rem)] leading-[0.82] md:mx-0">
              {t.home.title}
              <br />
              <em>{t.home.titleEm}</em>
            </h1>
          </div>
          <div className="mt-10 flex items-end justify-center gap-8 md:justify-between">
            <p className="mx-auto max-w-sm text-sm leading-6 text-hero-muted md:mx-0">{t.home.lead}</p>
            <ArrowDown className="hidden size-5 md:block" />
          </div>
        </div>
      </section>

      <section className="bg-background px-5 py-20 md:px-10 md:py-28 lg:px-14">
        <div className="mx-auto grid max-w-screen-2xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-16">
          <Reveal>
            <div className="relative aspect-4/3 overflow-hidden bg-muted">
              <img
                src="/images/production/set-camera-cart.jpg"
                alt={t.home.crewAlt}
                width={1600}
                height={1067}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="max-w-md">
              <p className="section-label">{t.home.sectionLabel}</p>
              <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">
                {t.home.sectionTitle}
                <br />
                <em>{t.home.sectionTitleEm}</em>
              </h2>
              <p className="mt-8 max-w-sm text-sm leading-7 text-muted-foreground">{t.home.sectionBody}</p>
              <Link
                to="/production/work"
                className="mt-10 inline-flex items-center gap-3 border-b border-foreground pb-2 text-xs uppercase tracking-brand"
              >
                {t.home.explore}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
