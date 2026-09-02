import { createFileRoute, Link } from "@tanstack/react-router";
import { auteurs } from "@/lib/data";
import { useLivres } from "@/hooks/use-livres";

function initiales(nom: string) {
  return nom
    .split(" ")
    .map((m) => m[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const Route = createFileRoute("/auteurs/")({
  head: () => ({
    meta: [
      { title: "Auteurs & journalistes | Itobe" },
      {
        name: "description",
        content:
          "Découvrez les auteurs, romanciers et journalistes publiés par Itobe : biographies, ouvrages et articles.",
      },
      { property: "og:title", content: "Auteurs & journalistes | Itobe" },
      { property: "og:description", content: "Les plumes publiées par Itobe." },
      { property: "og:url", content: "/auteurs" },
      { property: "og:image", content: "/images/a-propos/hero.jpg" },
    ],
    links: [{ rel: "canonical", href: "/auteurs" }],
  }),
  component: AuteursPage,
});

function AuteursPage() {
  const { livres } = useLivres();
  return (
    <div className="auteurs-page theme-edition">
      <section className="apropos-page__hero auteurs-page__hero">
        <img src="/images/a-propos/hero.jpg" alt="" className="apropos-page__hero-bg" fetchPriority="high" />
        <div className="apropos-page__hero-overlay" aria-hidden />
        <div className="apropos-page__hero-content mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <p className="apropos-page__hero-kicker">Communauté</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-white md:text-5xl lg:text-6xl">
            Auteurs & journalistes.
            <br />
            <span className="text-brand-gold">Les voix qui racontent l&apos;Afrique.</span>
          </h1>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {auteurs.map((a) => (
          <Link
            key={a.slug}
            to="/auteurs/$slug"
            params={{ slug: a.slug }}
            className="group rounded-sm border border-border bg-card p-6 transition-shadow hover:shadow-md"
          >
            {a.photo ? (
              <img
                src={a.photo}
                alt=""
                className="size-16 rounded-full object-cover ring-2 ring-brand-gold/40"
              />
            ) : (
              <div className="grid size-16 place-items-center rounded-full bg-brand-orange/15 font-display text-xl text-brand-orange">
                {initiales(a.nom)}
              </div>
            )}
            <p className="mt-4 font-display text-xl group-hover:text-brand-orange">{a.nom}</p>
            <p className="text-sm text-muted-foreground">{a.role}</p>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
              {a.bio.replace(/\n+/g, " ")}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              {livres.filter((l) => l.auteur === a.slug).length} livre(s) · {a.ville}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
