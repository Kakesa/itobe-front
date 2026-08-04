import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Menu, Search, X } from "lucide-react";

type Lien = { to: string; label: string };

type PortalHeaderProps = {
  portail: "media" | "edition";
  titre: string;
  liens: readonly Lien[];
};

export function PortalHeader({ portail, titre, liens }: PortalHeaderProps) {
  const [ouvert, setOuvert] = useState(false);
  const home = portail === "media" ? "/media" : "/edition";
  const accent =
    portail === "media"
      ? "border-b-2 border-b-ochre"
      : "border-b-2 border-b-terracotta";

  return (
    <header className={`sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur ${accent}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          to="/"
          aria-label="Retour aux portails Itobe"
          className="grid size-9 shrink-0 place-items-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <Link to={home} className="shrink-0">
          <span className="block font-display text-lg leading-none tracking-tight md:text-xl">
            Itobe<span className="text-accent">.</span>
          </span>
          <span className="mt-0.5 block text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            {titre}
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex">
          {liens.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: l.to === home }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/recherche"
            aria-label="Recherche"
            className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="size-4" />
          </Link>
          <Link
            to="/connexion"
            className="hidden rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Connexion
          </Link>
          <button
            className="grid size-9 place-items-center rounded-full border border-border lg:hidden"
            aria-label="Menu"
            onClick={() => setOuvert((v) => !v)}
          >
            {ouvert ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {ouvert && (
        <nav className="border-t border-border bg-card px-4 py-3 lg:hidden">
          {liens.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              onClick={() => setOuvert(false)}
              className="block py-2 text-sm text-muted-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: l.to === home }}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/connexion" onClick={() => setOuvert(false)} className="block py-2 text-sm">
            Connexion
          </Link>
        </nav>
      )}
    </header>
  );
}

export const liensMedia = [
  { to: "/media", label: "Actualités" },
  { to: "/auteurs", label: "Auteurs" },
  { to: "/recherche", label: "Recherche" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export const liensEdition = [
  { to: "/edition", label: "Catalogue" },
  { to: "/auteurs", label: "Auteurs" },
  { to: "/bibliotheque", label: "Bibliothèque" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;
