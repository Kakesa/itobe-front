import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";

const liens = [
  { to: "/media", label: "Média" },
  { to: "/edition", label: "Maison d'édition" },
  { to: "/auteurs", label: "Auteurs" },
  { to: "/bibliotheque", label: "Bibliothèque" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="font-display text-xl tracking-tight">
          Itobe<span className="text-accent">.</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-6 md:flex">
          {liens.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
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
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Connexion
          </Link>
          <button
            className="grid size-9 place-items-center rounded-full border border-border md:hidden"
            aria-label="Menu"
            onClick={() => setOuvert((v) => !v)}
          >
            {ouvert ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {ouvert && (
        <nav className="border-t border-border bg-card px-4 py-3 md:hidden">
          {liens.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOuvert(false)}
              className="block py-2 text-sm text-muted-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
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
