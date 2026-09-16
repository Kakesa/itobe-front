import { createFileRoute } from "@tanstack/react-router";
import { MaskedLine } from "@/components/production/motion-reveal";
import { useProductionCopy } from "@/lib/production/copy";

export const Route = createFileRoute("/production/work/")({
  head: () => ({
    meta: [
      { title: "Work — Itobe Production" },
      {
        name: "description",
        content: "Discover the productions currently in development at Itobe Production.",
      },
      { property: "og:title", content: "Work — Itobe Production" },
      {
        property: "og:description",
        content: "Original cinema from Itobe Production: stories rooted in Africa, made for the world.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/production/work" },
    ],
    links: [{ rel: "canonical", href: "/production/work" }],
  }),
  component: WorkPage,
});

function WorkPage() {
  const t = useProductionCopy();

  return (
    <div className="page-shell">
      <section className="flex min-h-[88svh] items-center border-t border-border px-5 py-28 md:px-10 md:py-40 lg:px-14">
        <div className="mx-auto max-w-screen-2xl text-center">
          <p className="section-label inline-flex items-center justify-center gap-2.5">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            {t.work.kicker}
          </p>
          <h2 className="mx-auto mt-7 max-w-4xl font-display text-5xl leading-[0.95] md:text-8xl">
            <MaskedLine delay={0.28}>{t.work.title}</MaskedLine>
            <MaskedLine delay={0.46} italic>
              {t.work.titleEm}
            </MaskedLine>
          </h2>
          <p className="prod-reveal mx-auto mt-8 max-w-md text-sm leading-7 text-muted-foreground">
            {t.work.body}
          </p>
        </div>
      </section>
    </div>
  );
}
