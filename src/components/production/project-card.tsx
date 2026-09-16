import { Link } from "@tanstack/react-router";
import type { Project } from "@/lib/production/studio-data";
import { useProductionCopy } from "@/lib/production/copy";

export function ProjectCard({ project, portrait = false }: { project: Project; portrait?: boolean }) {
  const t = useProductionCopy();

  return (
    <Link
      to="/production/work/$slug"
      params={{ slug: project.slug }}
      className="group block"
      aria-label={t.project.view.replace("{title}", project.title)}
    >
      <div className={`relative overflow-hidden bg-muted ${portrait ? "aspect-4/5" : "aspect-4/3"}`}>
        <img
          src={project.image}
          alt={project.alt}
          width={project.imageWidth}
          height={project.imageHeight}
          loading="lazy"
          className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-project-overlay opacity-25 transition-opacity duration-700 group-hover:opacity-65" />
        <div className="absolute inset-x-0 bottom-0 translate-y-3 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:p-8">
          <p className="text-xs uppercase text-hero-muted">
            {project.type} · {project.year}
          </p>
          <h3 className="mt-2 font-display text-3xl text-hero-foreground md:text-4xl">{project.title}</h3>
        </div>
      </div>
      <div className="flex items-start justify-between gap-4 border-b border-border py-4">
        <div className="flex gap-5">
          <span className="text-xs text-muted-foreground">{project.number}</span>
          <div>
            <h3 className="font-display text-2xl leading-none">{project.title}</h3>
            <p className="mt-2 text-xs uppercase text-muted-foreground">{project.type}</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{project.year}</span>
      </div>
    </Link>
  );
}
