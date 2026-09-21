import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/entreprise/about")({
  head: () => ({
    meta: [
      { title: "About — ITOBE Entreprises" },
      {
        name: "description",
        content:
          "ITOBE Entreprises est un groupe d'entreprises dédié à la création, à la production, à l'édition et à la diffusion de contenus qui mettent en lumière les cultures, les histoires, les talents et les imaginaires africains.",
      },
      { property: "og:title", content: "About — ITOBE Entreprises" },
      {
        property: "og:description",
        content:
          "Un écosystème qui accompagne les idées et les créateurs, de leur développement jusqu'à leur rencontre avec le public.",
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
      <h1 className="mt-3 font-display text-3xl leading-snug md:text-4xl md:leading-snug">
        ITOBE Entreprises est un groupe d&apos;entreprises dédié à la création, à
        la production, à l&apos;édition et à la diffusion de contenus qui
        mettent en lumière les cultures, les histoires, les talents et les
        imaginaires africains.
      </h1>
      <p className="mt-8 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
        À travers nos différentes entités, nous construisons un écosystème qui
        accompagne les idées et les créateurs, de leur développement jusqu&apos;à
        leur rencontre avec le public.
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
