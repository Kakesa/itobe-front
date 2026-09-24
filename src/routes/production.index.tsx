/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { Typewriter } from "@/components/production/motion-reveal";
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-footer/80 to-transparent" />
        <div className="relative mx-auto flex h-full min-h-svh max-w-screen-2xl flex-col justify-end px-5 pb-10 pt-32 text-center md:px-10 md:pb-14 md:text-left lg:px-14">
          <div className="relative">
            <Typewriter
              text={t.home.lead}
              className="prod-typewriter mx-auto w-full max-w-6xl min-h-[2.6em] font-display text-[clamp(1.45rem,3.2vw,2.35rem)] leading-[1.3] md:mx-0 md:pr-10"
            />
            <ArrowDown className="absolute bottom-1 right-0 hidden size-5 shrink-0 md:block" />
          </div>
        </div>
      </section>
    </div>
  );
}
