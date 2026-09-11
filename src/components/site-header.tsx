import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { useADesAchats } from "@/hooks/use-a-des-achats";
import { usePortailActif } from "@/hooks/use-portail";
import { useRole } from "@/hooks/use-role";
import { useSession } from "@/hooks/use-session";
import { destinationMonEspace } from "@/lib/redirect-navigation";
import { useI18n, type Locale } from "@/i18n";

type Lien = { to: string; label: string; exact?: boolean };

export function SiteHeader() {
  const { locale, setLocale, t } = useI18n();
  const portail = usePortailActif();
  const { aDesAchats } = useADesAchats();
  const { connecte, pret, session, deconnexion } = useSession();
  const { role } = useRole();
  const navigate = useNavigate();
  const [ouvert, setOuvert] = useState(false);
  const espaceUrl = destinationMonEspace(role);
  const espaceLabel =
    role === "admin"
      ? t.nav.auth.espaceAdmin
      : role === "editeur"
        ? t.nav.auth.espaceEditeur
        : t.nav.auth.monEspace;
  const home = portail === "media" ? "/media" : "/edition";
  const titre = portail === "media" ? t.nav.media.tagline : t.nav.edition.tagline;
  const liens = useMemo(() => {
    const base: Lien[] =
      portail === "media"
        ? [
            { to: "/media", label: t.nav.media.articles, exact: true },
            { to: "/media/videos", label: t.nav.media.videos },
            { to: "/media/a-propos", label: t.nav.media.aPropos },
            { to: "/contact", label: t.nav.media.contact },
          ]
        : [
            { to: "/edition", label: t.nav.edition.catalogue, exact: true },
            { to: "/auteurs", label: t.nav.edition.auteurs },
            { to: "/bibliotheque", label: t.nav.edition.bibliotheque },
            { to: "/a-propos", label: t.nav.edition.aPropos },
            { to: "/contact", label: t.nav.edition.contact },
          ];
    if (portail === "edition" && !aDesAchats) {
      return base.filter((l) => l.to !== "/bibliotheque");
    }
    return base;
  }, [portail, aDesAchats, t]);
  const accent =
    portail === "media" ? "border-b-brand-blue" : "border-b-brand-orange";

  const seDeconnecter = () => {
    deconnexion();
    setOuvert(false);
    void navigate({ to: portail === "media" ? "/media" : "/edition" });
  };

  const LanguageSwitch = ({ className = "" }: { className?: string }) => (
    <div
      className={`inline-flex items-center rounded-sm border border-border p-0.5 text-xs font-semibold ${className}`}
      role="group"
      aria-label={t.common.language}
    >
      {(["fr", "en"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded-sm px-2 py-1 transition ${
            locale === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={locale === code}
        >
          {code === "fr" ? t.common.langFr : t.common.langEn}
        </button>
      ))}
    </div>
  );

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
          {t.nav.auth.deconnexion}
        </button>
      </>
    ) : (
      <>
        <Link
          to="/connexion"
          className="site-header__auth-button hidden rounded-sm border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary sm:inline-flex"
        >
          {t.nav.auth.connexion}
        </Link>
        <Link
          to="/connexion"
          search={{ mode: "inscription" }}
          className="site-header__auth-button site-header__auth-button--primary hidden rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
        >
          {t.nav.auth.inscription}
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
          {t.nav.auth.deconnexion}
        </button>
      </>
    ) : (
      <>
        <Link
          to="/connexion"
          onClick={() => setOuvert(false)}
          className="block py-2 text-sm font-medium"
        >
          {t.nav.auth.connexion}
        </Link>
        <Link
          to="/connexion"
          search={{ mode: "inscription" }}
          onClick={() => setOuvert(false)}
          className="block py-2 text-sm text-muted-foreground"
        >
          {t.nav.auth.inscription}
        </Link>
      </>
    )
  ) : null;

  return (
    <header
      className={`site-header sticky top-0 z-40 border-b-2 border-border bg-transparent ${accent}`}
    >
      <div className="site-header__inner mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to={home} className="site-header__brand shrink-0">
          {portail === "media" ? (
            <img
              src="/images/neno-logo.png"
              alt="NENO"
              className="site-header__neno"
            />
          ) : (
            <>
              <span className="flex items-center gap-2.5">
                <span className="site-header__logo-mark" aria-hidden>
                  I
                </span>
                <span className="site-header__logo-text">ITOBE</span>
              </span>
              <span className="site-header__tagline">{titre}</span>
            </>
          )}
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
          <LanguageSwitch className="hidden sm:inline-flex" />
          {liensAuthDesktop}
          <button
            type="button"
            className="grid size-9 place-items-center rounded-sm border border-border lg:hidden"
            aria-label={t.common.menu}
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
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-muted-foreground">{t.common.language}</span>
            <LanguageSwitch />
          </div>
          <div className="my-2 border-t border-border" />
          {liensAuthMobile}
          <Link
            to={portail === "media" ? "/edition" : "/media"}
            onClick={() => setOuvert(false)}
            className="block py-2 text-sm text-muted-foreground"
          >
            {portail === "media" ? t.nav.switchToEdition : t.nav.switchToMedia}
          </Link>
        </nav>
      )}
    </header>
  );
}
