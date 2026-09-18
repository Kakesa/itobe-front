/* eslint-disable prettier/prettier */
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/entreprise/founders")({
  head: () => ({
    meta: [
      { title: "Founders — ITOBE Entreprises" },
      {
        name: "description",
        content:
          "Les fondateurs d'ITOBE Entreprises : la vision derrière le média, la maison d'édition et le studio de production.",
      },
      { property: "og:title", content: "Founders — ITOBE Entreprises" },
      {
        property: "og:description",
        content:
          "Les voix à l'origine d'ITOBE — raconter l'Afrique, depuis l'Afrique, vers le monde.",
      },
      { property: "og:url", content: "/entreprise/founders" },
    ],
    links: [{ rel: "canonical", href: "/entreprise/founders" }],
  }),
  component: EntrepriseFounders,
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
  },
];

function EntrepriseFounders() {
  return (
    <article className="groupe-founders mx-auto w-full max-w-5xl">
      <header className="max-w-3xl">
        <p className="text-[0.78rem] font-semibold uppercase tracking-brand text-muted-foreground">
          Founders
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.12] md:text-6xl">
          Les voix à l&apos;origine.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
          ITOBE Entreprises naît d&apos;une conviction simple : les récits
          africains méritent une maison capable de les porter en articles, en
          livres et à l&apos;écran — sans les diluer.
        </p>
      </header>

      <blockquote className="groupe-founders__manifest mt-12 md:mt-16">
        <p className="font-display text-2xl leading-snug italic md:text-3xl md:leading-snug">
          « Raconter l&apos;Afrique, depuis l&apos;Afrique, vers le monde. »
        </p>
        <footer className="mt-4 text-[0.72rem] font-semibold uppercase tracking-brand text-muted-foreground">
          Ligne fondatrice · ITOBE
        </footer>
      </blockquote>

      <ol className="mt-16 space-y-16 md:mt-24 md:space-y-24">
        {fondateurs.map((f, i) => (
          <li
            key={f.nom}
            className={`groupe-founders__card groupe-founders__card--${f.ton} ${
              i % 2 === 1 ? "groupe-founders__card--reverse" : ""
            }`}
          >
            <div className={`groupe-founders__portrait groupe-founders__portrait--${f.ton}`}>
              <span className="groupe-founders__mark" aria-hidden>
                {f.initiales}
              </span>
              <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
                <p className="text-[0.72rem] font-semibold uppercase tracking-brand opacity-70">
                  {f.index}
                </p>
                <div>
                  <p className="font-display text-3xl leading-tight md:text-4xl">{f.nom}</p>
                  <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-brand opacity-75">
                    {f.lieu}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center py-2 md:py-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-brand text-muted-foreground">
                {f.role}
              </p>
              <p className="mt-5 text-base leading-7 text-muted-foreground md:text-[1.05rem] md:leading-8">
                {f.bio}
              </p>
              <p className="mt-6 font-display text-xl leading-snug italic text-foreground md:text-2xl">
                « {f.citation} »
              </p>
            </div>
          </li>
        ))}
      </ol>

      <footer className="mt-20 border-t border-border pt-10 md:mt-28">
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          Pour un échange avec le groupe — partenariats, presse ou projets
          transversaux —{" "}
          <Link
            to="/entreprise/contact"
            className="font-medium text-foreground underline underline-offset-4"
          >
            écrivez-nous
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}
