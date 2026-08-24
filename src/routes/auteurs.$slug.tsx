import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookCard } from "@/components/book-card";
import { articles, auteurs, formatDate, getAuteur } from "@/lib/data";
import { useLivres } from "@/hooks/use-livres";

export const Route = createFileRoute("/auteurs/$slug")({
  loader: ({ params }) => {
    if (!getAuteur(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params, loaderData }) => {
    const a = loaderData ? getAuteur(loaderData.slug) : undefined;
    if (!a) {
      return { meta: [{ title: "Auteur introuvable" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${a.nom} — ${a.role} | Itobe` },
        { name: "description", content: a.bio.slice(0, 155) },
        { property: "og:title", content: `${a.nom} | Itobe` },
        { property: "og:description", content: a.bio.slice(0, 155) },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `/auteurs/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/auteurs/${params.slug}` }],
    };
  },
  component: AuteurPage,
});

function AuteurPage() {
  const { slug } = Route.useParams();
  const { livres } = useLivres();
  const auteur = auteurs.find((a) => a.slug === slug)!;
  const sesLivres = livres.filter((l) => l.auteur === slug);
  const sesArticles = articles.filter((a) => a.auteur === slug);

  const stats = [
    ["Ventes", auteur.ventes],
    ["Lectures", auteur.lectures],
    ["Téléchargements", auteur.telechargements],
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="flex flex-wrap items-start gap-8">
        <div className="grid size-28 place-items-center rounded-full bg-accent/15 font-display text-3xl text-accent">
          {auteur.nom
            .split(" ")
            .map((m) => m[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="flex-1">
          <p className="kicker">{auteur.role}</p>
          <h1 className="mt-2 text-4xl md:text-5xl">{auteur.nom}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{auteur.ville}</p>
          <p className="mt-5 max-w-2xl leading-relaxed">{auteur.bio}</p>
          <div className="mt-5 flex gap-3">
            {auteur.reseaux.map((r) => (
              <a
                key={r.label}
                href={r.url}
                className="rounded-sm border border-border px-3 py-1.5 text-xs hover:bg-secondary"
              >
                {r.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-4">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-sm border border-border bg-card p-5">
            <p className="font-display text-3xl">{v.toLocaleString("fr-FR")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k}</p>
          </div>
        ))}
      </div>

      {sesLivres.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl">Livres publiés</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {sesLivres.map((l, i) => (
              <BookCard key={l.slug} livre={l} index={i} showAuteur={false} />
            ))}
          </div>
        </section>
      )}

      {sesArticles.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl">Articles publiés</h2>
          <ul className="mt-6 divide-y divide-border">
            {sesArticles.map((a) => (
              <li key={a.slug} className="py-4">
                <Link
                  to="/media/$slug"
                  params={{ slug: a.slug }}
                  className="font-display text-lg hover:text-accent"
                >
                  {a.titre}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {a.categorie} · {formatDate(a.date)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
