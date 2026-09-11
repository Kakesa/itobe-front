import { Link } from "@tanstack/react-router";
import { ArrowLeft, Facebook, Instagram, Linkedin } from "lucide-react";
import { useMemo, useState } from "react";
import { NewsletterApi } from "@/lib/api-client";
import { usePortailActif } from "@/hooks/use-portail";
import { useI18n } from "@/i18n";

function IconeX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  const portail = usePortailActif();
  const estMedia = portail === "media";
  const [email, setEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState<{ ok: boolean; texte: string } | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const liensMedia = useMemo(
    () => [
      { label: t.nav.media.articles, to: "/media" as const },
      { label: t.nav.media.videos, to: "/media/videos" as const },
      { label: t.nav.media.aPropos, to: "/media/a-propos" as const },
      { label: t.nav.media.contact, to: "/contact" as const },
    ],
    [t],
  );

  const liensEdition = useMemo(
    () => [
      { label: t.nav.edition.catalogue, to: "/edition" as const },
      { label: t.nav.edition.aPropos, to: "/a-propos" as const },
      { label: t.nav.edition.contact, to: "/contact" as const },
    ],
    [t],
  );

  const inscrireNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterMsg(null);
    const valeur = email.trim();
    if (!valeur) return;

    setNewsletterLoading(true);
    try {
      await NewsletterApi.subscribe(valeur);
      setNewsletterMsg({ ok: true, texte: t.footer.subscribeSuccess });
      setEmail("");
    } catch (err: unknown) {
      setNewsletterMsg({
        ok: false,
        texte: err instanceof Error ? err.message : t.footer.subscribeError,
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="site-footer mt-24">
      <div className="site-footer__inner mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              {estMedia ? (
                <img
                  src="/images/neno-logo.png"
                  alt="NENO"
                  className="site-footer__logo-neno"
                />
              ) : (
                <>
                  <img
                    src="/images/itobe-lynx-mark.png"
                    alt=""
                    className="site-footer__logo-mark"
                  />
                  <span className="font-display text-2xl tracking-[0.08em] text-white">ITOBE</span>
                </>
              )}
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/75">{t.footer.blurb}</p>
            <Link
              to="/"
              className="site-footer__link mt-5 inline-flex items-center gap-1.5 text-white/72 hover:text-white"
            >
              <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
              {t.footer.backToPortals}
            </Link>
          </div>

          <div>
            <p className="site-footer__heading">
              {estMedia ? t.footer.headingMedia : t.footer.headingEdition}
            </p>
            <ul className="mt-5 space-y-2.5">
              {(estMedia ? liensMedia : liensEdition).map((l) => (
                <li key={l.to + l.label}>
                  <Link to={l.to} className="site-footer__link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-lg text-white">{t.footer.newsletterTitle}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{t.footer.newsletterText}</p>
            <form onSubmit={inscrireNewsletter} className="mt-5 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.footer.emailPlaceholder}
                aria-label={t.footer.emailAria}
                className="site-footer__input min-w-0 flex-1 px-4 py-2.5 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="site-footer__cta shrink-0 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {newsletterLoading ? "…" : t.footer.subscribe}
              </button>
            </form>
            {newsletterMsg && (
              <p
                className={`mt-2 text-xs ${newsletterMsg.ok ? "text-[#d99b4f]" : "text-red-300"}`}
                role="status"
              >
                {newsletterMsg.texte}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="site-footer__bar border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-white/45 sm:flex-row">
          <p className="text-center sm:text-left">{t.footer.copyright}</p>
          <div className="flex items-center gap-3">
            {[
              { label: "X (Twitter)", href: "https://x.com", Icon: IconeX },
              { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
              { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
              { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
            ].map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="site-footer__social"
              >
                <Icon className="size-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
