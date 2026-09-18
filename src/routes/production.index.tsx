/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
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
          className="prod-hero__image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex h-full min-h-svh max-w-screen-2xl flex-col justify-end px-5 pb-10 pt-32 text-center md:px-10 md:pb-14 md:text-left lg:px-14">
          <div className="flex items-end justify-center gap-8 md:justify-between">
            <h1 className="prod-reveal mx-auto max-w-xl font-display text-[clamp(1.45rem,2.8vw,2.15rem)] leading-snug md:mx-0">
              {t.home.lead}
            </h1>
            <ArrowDown className="hidden size-5 shrink-0 md:block" />
          </div>
        </div>
      </section>
    </div>
  );
}
