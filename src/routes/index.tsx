/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Newspaper } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Itobe — Média & maison d'édition numérique" },
      {
        name: "description",
        content:
          "Choisissez votre portail : Média pour l'actualité et les articles, ou Maison d'édition pour le catalogue et la lecture en ligne.",
      },
      { property: "og:title", content: "Itobe — Média & maison d'édition numérique" },
      {
        property: "og:description",
        content: "Deux portails, un écosystème : Média et Maison d'édition.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Accueil,
});

const IMG_MEDIA = "/images/neno-logo.jpg";
const IMG_EDITION = "/images/itobe-editions-logo.png";

function Accueil() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 paper-grain opacity-60"
      />

      <div className="relative z-10 w-full max-w-5xl">
        <header className="mb-10 flex flex-col items-center gap-0 text-center">
          <img
            src="/images/itobe-entreprises-logo.png"
            alt="ITOBE Entreprises"
            className="block h-20 w-auto object-contain md:h-28"
            width={263}
            height={144}
          />
          <p className="mt-3 text-sm text-muted-foreground md:mt-4 md:text-base">
            Deux univers · une plateforme
          </p>
        </header>

        <main className="grid gap-5 md:grid-cols-2 md:gap-6">
          <Link
            to="/media"
            className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden bg-black">
              <img
                src={IMG_MEDIA}
                alt="Logo NENO"
                className="max-h-[85%] w-auto max-w-[90%] object-contain mix-blend-screen [filter:invert(1)_hue-rotate(180deg)] transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-sm bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <Newspaper className="size-3.5" />
                Portail
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-7">
              <h1 className="font-display text-3xl leading-tight md:text-4xl">Média</h1>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                Actualités, articles, interviews et chroniques — la rédaction Itobe.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-accent">
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
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-sm bg-[#fdfaf4]/95 px-2.5 py-1 text-xs font-medium text-[#383030] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                <BookOpen className="size-3.5 text-[#ea5312] transition-transform duration-500 group-hover:-rotate-12" />
                Portail
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-7">
              <h1 className="font-display text-3xl leading-tight text-[#211c1c] md:text-4xl">
                Maison d&apos;édition
              </h1>
              <p className="mt-3 text-sm text-[#383030]/80 md:text-base">
                Faire de l&apos;Afrique le cœur de la narration mondiale.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-[#ea5312]">
                Entrer dans l&apos;édition
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        </main>
      </div>
    </div>
  );
}
