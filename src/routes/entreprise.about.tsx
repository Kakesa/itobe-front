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

const fondateurs = [
  {
    index: "01",
    initiales: "CB",
    nom: "Christian Bigomukero",
    role: "Fondateur · Média & édition",
    lieu: "Kinshasa",
    citation:
      "Un récit africain n'a pas besoin d'être traduit pour exister. Il a besoin d'un lieu où il peut durer.",
    bio: "Christian Bigomukero a conçu ITOBE comme un écosystème : le reportage, le livre et l'écran dans une même maison. Il porte la ligne éditoriale du groupe — des enquêtes de NENO aux collections d'Itobe Éditions.",
    ton: "ink" as const,
    photo: null as string | null,
  },
  {
    index: "02",
    initiales: "CB",
    nom: "Christopher Bigo",
    role: "Fondateur · Vision & production",
    lieu: "Kinshasa",
    citation:
      "Le cinéma, le livre et la presse ne sont pas des silos. Ce sont trois portes vers la même mémoire.",
    bio: "Christopher Bigo a impulsé ITOBE Entreprises comme plateforme de groupe : un cadre pour que le média, l'édition et la production se parlent. Il veille à la vision d'ensemble et aux projets qui traversent les trois univers.",
    ton: "warm" as const,
    photo: "/images/entreprise/christopher-bigo.jpg",
  },
];

function EntrepriseAbout() {
  return (
    <article className="groupe-founders mx-auto w-full max-w-5xl">
      <div className="max-w-3xl">
        <p className="text-[0.78rem] font-semibold uppercase tracking-brand text-muted-foreground">About</p>
        <h1 className="mt-3 font-display text-3xl leading-snug md:text-4xl md:leading-snug">
          ITOBE Entreprises est un groupe d&apos;entreprises dédié à la création, à la production, à l&apos;édition et à la diffusion de contenus qui mettent en lumière les cultures, les histoires, les talents et les imaginaires africains.
        </h1>
        <p className="mt-8 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
          À travers nos différentes entités, nous construisons un écosystème qui accompagne les idées et les créateurs, de leur développement jusqu&apos;à leur rencontre avec le public.
        </p>
      </div>

      <section className="mt-16 md:mt-24" aria-labelledby="fondateurs-title">
        <header className="max-w-3xl">
          <p className="text-[0.78rem] font-semibold uppercase tracking-brand text-muted-foreground">Fondateurs</p>
          <h2 id="fondateurs-title" className="mt-3 font-display text-4xl leading-[1.12] md:text-6xl">Les voix à l&apos;origine.</h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            ITOBE Entreprises naît d&apos;une conviction simple : les récits africains méritent une maison capable de les porter en articles, en livres et à l&apos;écran — sans les diluer.
          </p>
        </header>

        <blockquote className="groupe-founders__manifest mt-12 md:mt-16">
          <p className="font-display text-2xl leading-snug italic md:text-3xl md:leading-snug">« Raconter l&apos;Afrique, depuis l&apos;Afrique, vers le monde. »</p>
          <footer className="mt-4 text-[0.72rem] font-semibold uppercase tracking-brand text-muted-foreground">Ligne fondatrice · ITOBE</footer>
        </blockquote>

        <ol className="mt-16 space-y-16 md:mt-24 md:space-y-24">
          {fondateurs.map((f, i) => (
            <li key={f.nom} className={`groupe-founders__card groupe-founders__card--${f.ton} ${i % 2 === 1 ? "groupe-founders__card--reverse" : ""}`}>
              <div className={`groupe-founders__portrait groupe-founders__portrait--${f.ton}${f.photo ? " groupe-founders__portrait--photo" : ""}`}>
                {f.photo ? <img src={f.photo} alt={f.nom} width={900} height={1200} className="groupe-founders__photo" /> : null}
                <span className="groupe-founders__mark" aria-hidden>{f.initiales}</span>
                <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-brand opacity-70">{f.index}</p>
                  <div>
                    <p className="font-display text-3xl leading-tight md:text-4xl">{f.nom}</p>
                    <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-brand opacity-75">{f.lieu}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center py-2 md:py-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-brand text-muted-foreground">{f.role}</p>
                <p className="mt-5 text-base leading-7 text-muted-foreground md:text-[1.05rem] md:leading-8">{f.bio}</p>
                <p className="mt-6 font-display text-xl leading-snug italic text-foreground md:text-2xl">« {f.citation} »</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-20 border-t border-border pt-10 md:mt-28">
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          Un projet de groupe?{" "}
          <Link to="/entreprise/contact" className="font-medium text-foreground underline underline-offset-4">Contactez-nous</Link>.
        </p>
      </footer>
    </article>
  );
}
