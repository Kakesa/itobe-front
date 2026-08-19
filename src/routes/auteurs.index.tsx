import { createFileRoute, Link } from "@tanstack/react-router";
import { auteurs } from "@/lib/data";
import { useLivres } from "@/hooks/use-livres";

export const Route = createFileRoute("/auteurs/")({
  head: () => ({
    meta: [
      { title: "Auteurs & journalistes | Itobe" },
      {
        name: "description",
        content:
          "Découvrez les auteurs, romanciers et journalistes publiés par Itobe : biographies, ouvrages, articles et statistiques de lecture.",
      },
      { property: "og:title", content: "Auteurs & journalistes | Itobe" },
      { property: "og:description", content: "Les plumes publiées par Itobe." },
      { property: "og:url", content: "/auteurs" },
    ],
    links: [{ rel: "canonical", href: "/auteurs" }],
  }),
  component: AuteursPage,
});

function AuteursPage() {
  const { livres } = useLivres();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="kicker">Communauté</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Auteurs & journalistes</h1>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {auteurs.map((a) => (
          <Link
            key={a.slug}
            to="/auteurs/$slug"
            params={{ slug: a.slug }}
            className="group rounded-sm border border-border bg-card p-6"
          >
            <div className="grid size-16 place-items-center rounded-full bg-accent/15 font-display text-xl text-accent">
              {a.nom
                .split(" ")
                .map((m) => m[0])
                .join("")
                .slice(0, 2)}
            </div>
            <p className="mt-4 font-display text-xl group-hover:text-accent">{a.nom}</p>
            <p className="text-sm text-muted-foreground">{a.role}</p>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{a.bio}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              {livres.filter((l) => l.auteur === a.slug).length} livres ·{" "}
              {a.lectures.toLocaleString("fr-FR")} lectures
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
