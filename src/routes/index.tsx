/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { GroupeNav } from "@/components/groupe-chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Itobe — Média, édition & production" },
      {
        name: "description",
        content:
          "Choisissez votre portail : Média, Maison d'édition ou Production — trois univers, une plateforme Itobe.",
      },
      { property: "og:title", content: "Itobe — Média, édition & production" },
      {
        property: "og:description",
        content: "Trois portails, un écosystème : Média, Maison d'édition et Production.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Accueil,
});

const IMG_MEDIA = "/images/neno-black.png";
const IMG_EDITION = "/images/itobe-editions-logo.png";
const IMG_PRODUCTION = "/images/itobe-prod-black.png";

function Accueil() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 paper-grain opacity-60"
      />

      <GroupeNav />

      <div className="relative z-10 w-full max-w-6xl">
        <header className="mb-10 flex flex-col items-center gap-0 text-center">
          <img
            src="/images/itobe-entreprises-logo.png"
            alt="ITOBE Entreprises"
            className="block h-20 w-auto object-contain md:h-28"
            width={263}
            height={144}
          />
          <p className="mt-3 text-sm text-muted-foreground md:mt-4 md:text-base">
            Ranconter l'afrique, Inspirer le monde
          </p>
        </header>

        <main className="grid gap-5 md:grid-cols-3 md:gap-6">
          <Link
            to="/media"
            className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden bg-black">
              <img
                src={IMG_MEDIA}
                alt="Logo Neno"
                className="max-h-[70%] w-auto max-w-[85%] object-contain transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-7">
              <h2 className="font-display text-3xl leading-tight md:text-4xl">Média</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                Actualités, articles, interviews et chroniques — la rédaction Itobe.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-neno-pink">
                Entrer dans le média
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>

          <Link
            to="/edition"
            className="group flex flex-col overflow-hidden rounded-sm border border-[#383030]/15 bg-[#fdfaf4] shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-16px_rgba(234,83,18,0.25)]"
          >
            <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden bg-black">
              <img
                src={IMG_EDITION}
                alt="Logo Itobe Éditions"
                className="max-h-[70%] w-auto max-w-[85%] object-contain transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-7">
              <h2 className="font-display text-3xl leading-tight text-[#211c1c] md:text-4xl">
                Édition
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#383030]/80 md:text-base md:leading-7">
                Romans, essais et jeunesse — faire de l&apos;Afrique le cœur de la narration
                mondiale.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-[#ea5312]">
                Entrer dans l&apos;édition
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>

          <Link
            to="/production"
            className="group flex flex-col overflow-hidden rounded-none border border-[#c9c2b5]/60 bg-card shadow-soft transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden bg-black">
              <img
                src={IMG_PRODUCTION}
                alt="Logo Itobe Productions"
                className="max-h-[82%] w-auto max-w-[88%] object-contain mix-blend-screen transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-7">
              <h2 className="font-display text-3xl leading-tight text-[#241f1a] md:text-4xl">
                Production
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#241f1a]/75 md:text-base md:leading-7">
                Films, séries et documentaires — un cinéma enraciné en Afrique.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-[#8f7a55]">
                Entrer dans la production
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        </main>
      </div>
    </div>
  );
}
