import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/production/motion-reveal";
import { ProjectCard } from "@/components/production/project-card";
import { localizeProject, projects } from "@/lib/production/studio-data";
import { useProductionCopy } from "@/lib/production/copy";

export const Route = createFileRoute("/production/work/$slug")({
  loader: ({ params }) => {
    const project = projects.find((item) => item.slug === params.slug);
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData, params }) => {
    const title = loaderData ? `${loaderData.title} — Itobe Production` : "Production unavailable — Itobe Production";
    const description = loaderData?.logline ?? "Explore original work by Itobe Production.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/production/work/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/production/work/${params.slug}` }],
    };
  },
  component: ProjectPage,
});

function ProjectPage() {
  const t = useProductionCopy();
  const baseProject = Route.useLoaderData();
  const project = localizeProject(baseProject, t);
  const similar = projects
    .filter((item) => item.slug !== project.slug)
    .slice(0, 2)
    .map((item) => localizeProject(item, t));
  return (
    <article className="page-shell">
      <section className="relative min-h-[84svh] overflow-hidden bg-footer text-hero-foreground">
        <img
          src={project.image}
          alt={project.alt}
          width={project.imageWidth}
          height={project.imageHeight}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-project-hero-overlay" />
        <div className="relative mx-auto flex min-h-[84svh] max-w-screen-2xl flex-col justify-end px-5 pb-12 pt-36 md:px-10 md:pb-16 lg:px-14">
          <p className="mb-5 text-xs uppercase text-hero-muted">
            {project.type} · {project.year}
          </p>
          <h1 className="max-w-5xl font-display text-[clamp(3.6rem,9vw,9rem)] leading-[0.88]">
            {project.title}
          </h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-screen-2xl gap-16 px-5 py-24 md:grid-cols-[1fr_2fr] md:px-10 md:py-36 lg:px-14">
        <Reveal>
          <Link to="/production/work" className="inline-flex items-center gap-2 text-xs uppercase">
            <ArrowLeft className="size-4" /> {t.project.allWork}
          </Link>
        </Reveal>
        <Reveal>
          <p className="font-display text-3xl leading-snug md:text-5xl">{project.logline}</p>
          <p className="mt-10 max-w-2xl text-base leading-8 text-muted-foreground">{project.synopsis}</p>
        </Reveal>
      </section>
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-screen-2xl gap-px bg-border md:grid-cols-4">
          {(
            [
              [t.project.director, project.director],
              [t.project.producers, project.producers],
              [t.project.cast, project.cast],
              [t.project.filmedIn, project.location],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="bg-background p-7 md:min-h-48 md:p-9">
              <p className="section-label">{label}</p>
              <p className="mt-7 text-sm leading-7">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-screen-2xl px-5 py-24 md:px-10 md:py-36 lg:px-14">
        <Reveal className="aspect-video overflow-hidden bg-footer">
          <div className="relative h-full">
            <img
              src={project.image}
              alt={t.project.trailerAlt}
              width={project.imageWidth}
              height={project.imageHeight}
              loading="lazy"
              className="h-full w-full object-cover opacity-60"
            />
            <Button
              variant="cinematic"
              size="lg"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-hero-foreground"
            >
              <Play /> {t.project.watchTrailer}
            </Button>
          </div>
        </Reveal>
      </section>
      <section className="border-t border-border px-5 py-24 md:px-10 lg:px-14">
        <div className="mx-auto max-w-screen-2xl">
          <Reveal className="mb-12 flex items-end justify-between">
            <h2 className="font-display text-5xl md:text-7xl">{t.project.continue}</h2>
            <Link to="/production/work" className="hidden items-center gap-2 text-xs uppercase md:flex">
              {t.project.allWork} <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <div className="grid gap-12 md:grid-cols-2">
            {similar.map((item) => (
              <ProjectCard key={item.slug} project={item} />
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
