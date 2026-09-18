import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/entreprise/about")({
  head: () => ({
    meta: [
      { title: "About — ITOBE Entreprises" },
      {
        name: "description",
        content:
          "ITOBE Entreprises rassemble un média, une maison d'édition et un studio de production : trois univers, une même plateforme.",
      },
      { property: "og:title", content: "About — ITOBE Entreprises" },
      {
        property: "og:description",
        content:
          "Le groupe ITOBE : média, édition et production — raconter l'Afrique, depuis l'Afrique.",
      },
      { property: "og:url", content: "/entreprise/about" },
    ],
    links: [{ rel: "canonical", href: "/entreprise/about" }],
  }),
  component: EntrepriseAbout,
});

function EntrepriseAbout() {
  return (
    <article className="mx-auto w-full max-w-3xl">
      <p className="text-[0.78rem] font-semibold uppercase tracking-brand text-muted-foreground">
        About
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
        Une plateforme, trois univers.
      </h1>
      <p className="mt-6 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
        ITOBE Entreprises réunit un média, une maison d&apos;édition et un studio
        de production. Même ambition : raconter l&apos;Afrique, depuis
        l&apos;Afrique, vers le monde — en articles, en livres et à l&apos;écran.
      </p>
      <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
        Chaque portail a sa voix. Le groupe les tient ensemble, pour que les
        récits circulent d&apos;un format à l&apos;autre sans perdre leur ancrage.
      </p>

      <p className="mt-12 text-sm text-muted-foreground">
        Découvrir{" "}
        <Link
          to="/entreprise/founders"
          className="font-medium text-foreground underline underline-offset-4"
        >
          les fondateurs
        </Link>
        {" "}
        · un projet de groupe ?{" "}
        <Link
          to="/entreprise/contact"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Contactez-nous
        </Link>
        .
      </p>
    </article>
  );
}
