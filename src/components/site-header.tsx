import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { useADesAchats } from "@/hooks/use-a-des-achats";
import { usePortailActif } from "@/hooks/use-portail";
import { useRole } from "@/hooks/use-role";
import { useSession } from "@/hooks/use-session";
import { destinationMonEspace, labelMonEspace } from "@/lib/redirect-navigation";

type Lien = { to: string; label: string; exact?: boolean };

const liensMedia: Lien[] = [
  { to: "/media", label: "Actualités", exact: true },
  { to: "/auteurs", label: "Auteurs" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

const liensEdition: Lien[] = [
  { to: "/edition", label: "Catalogue", exact: true },
  { to: "/auteurs", label: "Auteurs" },
  { to: "/bibliotheque", label: "Bibliothèque" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const portail = usePortailActif();
  const { aDesAchats } = useADesAchats();
  const { connecte, pret, session, deconnexion } = useSession();
  const { role } = useRole();
  const navigate = useNavigate();
  const [ouvert, setOuvert] = useState(false);
  const espaceUrl = destinationMonEspace(role);
  const espaceLabel = labelMonEspace(role);
  const home = portail === "media" ? "/media" : "/edition";
  const titre = portail === "media" ? "Média" : "Maison d'édition";
  const liens = useMemo(() => {
    const base = portail === "media" ? liensMedia : liensEdition;
    if (portail === "edition" && !aDesAchats) {
      return base.filter((l) => l.to !== "/bibliotheque");
    }
    return base;
  }, [portail, aDesAchats]);
  const accent =
    portail === "media" ? "border-b-brand-blue" : "border-b-brand-orange";

  const seDeconnecter = () => {
    deconnexion();
    setOuvert(false);
    void navigate({ to: portail === "media" ? "/media" : "/edition" });
  };

  const liensAuthDesktop = pret ? (
    connecte ? (
      <>
        <Link
          to={espaceUrl}
          className="site-header__auth-button site-header__auth-button--primary hidden rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
        >
          {espaceLabel}
        </Link>
        <button
          type="button"
          onClick={seDeconnecter}
          className="site-header__auth-button hidden rounded-sm border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary sm:inline-flex"
        >
          Déconnexion
        </button>
      </>
    ) : (
      <>
        <Link
          to="/connexion"
          className="site-header__auth-button hidden rounded-sm border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary sm:inline-flex"
        >
          Connexion
        </Link>
        <Link
          to="/connexion"
          search={{ mode: "inscription" }}
          className="site-header__auth-button site-header__auth-button--primary hidden rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
        >
          Inscription
        </Link>
      </>
    )
  ) : null;

  const liensAuthMobile = pret ? (
    connecte ? (
      <>
        <Link
          to={espaceUrl}
          onClick={() => setOuvert(false)}
          className="block py-2 text-sm font-medium text-primary"
        >
          {espaceLabel}
        </Link>
        {session && (
          <p className="pb-1 text-xs text-muted-foreground">
            {session.prenom} {session.nom} · {session.email}
          </p>
        )}
        <button
          type="button"
          onClick={seDeconnecter}
          className="block w-full py-2 text-left text-sm text-muted-foreground"
        >
          Déconnexion
        </button>
      </>
    ) : (
      <>
        <Link
          to="/connexion"
          onClick={() => setOuvert(false)}
          className="block py-2 text-sm font-medium"
        >
          Connexion
        </Link>
        <Link
          to="/connexion"
          search={{ mode: "inscription" }}
          onClick={() => setOuvert(false)}
          className="block py-2 text-sm text-muted-foreground"
        >
          Inscription
        </Link>
      </>
    )
  ) : null;

  return (
    <header
      className={`site-header sticky top-0 z-40 border-b-2 border-border bg-background/90 backdrop-blur ${accent}`}
    >
      <div className="site-header__inner mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to={home} className="site-header__brand shrink-0">
          <span className="flex items-center gap-2.5">
            <span className="site-header__logo-mark" aria-hidden>
              I
            </span>
            <span className="site-header__logo-text">ITOBE</span>
          </span>
          <span className="site-header__tagline">{titre}</span>
        </Link>

        <nav className="site-header__nav site-header__nav--desktop hidden flex-1 items-center justify-center lg:flex">
          {liens.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              className="site-header__link"
              activeProps={{ className: "site-header__link is-active" }}
              activeOptions={{ exact: Boolean(l.exact) }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {liensAuthDesktop}
          <button
            type="button"
            className="grid size-9 place-items-center rounded-sm border border-border lg:hidden"
            aria-label="Menu"
            onClick={() => setOuvert((v) => !v)}
          >
            {ouvert ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {ouvert && (
        <nav className="site-header__nav site-header__nav--mobile border-t border-border bg-card px-4 py-3 lg:hidden">
          {liens.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              onClick={() => setOuvert(false)}
              className="site-header__link block py-2"
              activeProps={{ className: "site-header__link is-active block py-2" }}
              activeOptions={{ exact: Boolean(l.exact) }}
            >
              {l.label}
            </Link>
          ))}
          <div className="my-2 border-t border-border" />
          {liensAuthMobile}
          <Link
            to={portail === "media" ? "/edition" : "/media"}
            onClick={() => setOuvert(false)}
            className="block py-2 text-sm text-muted-foreground"
          >
            {portail === "media" ? "Maison d'édition" : "Portail Média"}
          </Link>
        </nav>
      )}
    </header>
  );
}
