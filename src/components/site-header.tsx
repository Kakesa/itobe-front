/* eslint-disable prettier/prettier */
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { useADesAchats } from "@/hooks/use-a-des-achats";
import { usePortailActif } from "@/hooks/use-portail";
import { useRole } from "@/hooks/use-role";
import { useSession } from "@/hooks/use-session";
import { destinationMonEspace } from "@/lib/redirect-navigation";
import { cn } from "@/lib/utils";
import { useI18n, type Locale } from "@/i18n";

type Lien = { to: string; label: string; exact?: boolean };

export function SiteHeader() {
  const { locale, setLocale, t } = useI18n();
  const portail = usePortailActif();
  const estMedia = portail === "media";
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
  const home = estMedia ? "/media" : "/edition";
  const liens = useMemo(() => {
    const base: Lien[] = estMedia
      ? [
          { to: "/media", label: t.nav.media.accueil, exact: true },
          { to: "/media/articles", label: t.nav.media.articles },
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
    if (!estMedia && !aDesAchats) {
      return base.filter((l) => l.to !== "/bibliotheque");
    }
    return base;
  }, [estMedia, aDesAchats, t]);

  const seDeconnecter = () => {
    deconnexion();
    setOuvert(false);
    void navigate({ to: estMedia ? "/media" : "/edition" });
  };

  const LanguageSwitch = ({ boxed = false, className = "" }: { boxed?: boolean; className?: string }) => (
    <div
      className={cn(
        "inline-flex items-center text-xs font-semibold",
        boxed ? "rounded-sm border border-border p-0.5" : "site-header__lang gap-1",
        className,
      )}
      role="group"
      aria-label={t.common.language}
    >
      {(["fr", "en"] as Locale[]).map((code, i) => (
        <span key={code} className="inline-flex items-center gap-1">
          {i > 0 && !boxed ? <span className="site-header__lang-sep">/</span> : null}
          <button
            type="button"
            onClick={() => setLocale(code)}
            className={
              boxed
                ? `rounded-sm px-2 py-1 transition ${
                    locale === code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                : cn("site-header__lang-btn", locale === code && "is-active")
            }
            aria-pressed={locale === code}
          >
            {code === "fr" ? t.common.langFr : t.common.langEn}
          </button>
        </span>
      ))}
    </div>
  );

  const liensAuthDesktop = pret ? (
    connecte ? (
      <>
        <Link
          to={espaceUrl}
          className={
            estMedia
              ? "site-header__text-link hidden sm:inline-flex"
              : "site-header__auth-button site-header__auth-button--primary hidden rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          }
        >
          {espaceLabel}
        </Link>
        <button
          type="button"
          onClick={seDeconnecter}
          className={
            estMedia
              ? "site-header__text-link hidden sm:inline-flex"
              : "site-header__auth-button hidden rounded-sm border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary sm:inline-flex"
          }
        >
          {t.nav.auth.deconnexion}
        </button>
      </>
    ) : estMedia ? null : (
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
    ) : estMedia ? null : (
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
      className={cn(
        "site-header sticky top-0 z-40",
        estMedia ? "site-header--media" : "site-header--edition border-b-2 border-b-brand-gold",
      )}
    >
      <div
        className={cn(
          "site-header__inner mx-auto flex items-center",
          estMedia
            ? "h-[4.5rem] max-w-none gap-6 px-5 lg:h-20 lg:px-10"
            : "h-16 max-w-6xl gap-4 px-4",
        )}
      >
        <Link to={home} className="site-header__brand shrink-0">
          {estMedia ? (
            <img src="/images/neno-logo.png" alt="NENO" className="site-header__neno" />
          ) : (
            <img
              src="/images/itobe-editions-logo.png"
              alt="Itobe Éditions"
              className="site-header__edition-logo"
            />
          )}
        </Link>

        <nav
          className={cn(
            "site-header__nav site-header__nav--desktop hidden lg:flex",
            estMedia ? "ml-auto items-center" : "flex-1 items-center justify-center",
          )}
        >
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

        <div className={cn("flex items-center", estMedia ? "gap-4" : "ml-auto gap-2")}>
          <LanguageSwitch boxed={!estMedia} className="hidden sm:inline-flex" />
          {liensAuthDesktop}
          <button
            type="button"
            className={
              estMedia
                ? "grid size-10 place-items-center lg:hidden"
                : "grid size-9 place-items-center rounded-sm border border-border lg:hidden"
            }
            aria-label={t.common.menu}
            onClick={() => setOuvert((v) => !v)}
          >
            {ouvert ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {ouvert && (
        <nav
          className={cn(
            "site-header__nav site-header__nav--mobile lg:hidden",
            estMedia ? "site-header__nav--mobile-media px-5 py-6" : "border-t px-4 py-3",
          )}
        >
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
            <LanguageSwitch boxed={!estMedia} />
          </div>
          <div className="my-2 border-t border-border" />
          {liensAuthMobile}
          <Link
            to={estMedia ? "/edition" : "/media"}
            onClick={() => setOuvert(false)}
            className="block py-2 text-sm text-muted-foreground"
          >
            {estMedia ? t.nav.switchToEdition : t.nav.switchToMedia}
          </Link>
        </nav>
      )}
    </header>
  );
}
