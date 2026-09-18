import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { NewsletterApi } from "@/lib/api-client";
import { useI18n } from "@/i18n";

const DELAY_MS = 2 * 60 * 1000;
const STATUS_KEY = "itobe-newsletter-popup";
const START_KEY = "itobe-newsletter-popup-start";

function dejaVu(): boolean {
  try {
    const v = localStorage.getItem(STATUS_KEY);
    return v === "dismissed" || v === "subscribed";
  } catch {
    return false;
  }
}

function marquer(status: "dismissed" | "subscribed") {
  try {
    localStorage.setItem(STATUS_KEY, status);
  } catch {
    /* ignore */
  }
}

export function NewsletterPopup() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  const [ouvert, setOuvert] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; texte: string } | null>(null);

  useEffect(() => {
    if (dejaVu()) return;

    let started = Date.now();
    try {
      const saved = sessionStorage.getItem(START_KEY);
      if (saved) started = Number(saved) || started;
      else sessionStorage.setItem(START_KEY, String(started));
    } catch {
      /* ignore */
    }

    const wait = Math.max(DELAY_MS - (Date.now() - started), 0);
    const id = window.setTimeout(() => {
      const path = pathRef.current;
      if (path.startsWith("/admin") || path.startsWith("/reader")) return;
      setOuvert(true);
    }, wait);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermer();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [ouvert]);

  const fermer = () => {
    marquer("dismissed");
    setOuvert(false);
  };

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const valeur = email.trim();
    if (!valeur) return;
    setLoading(true);
    setMsg(null);
    try {
      await NewsletterApi.subscribe(valeur);
      setMsg({ ok: true, texte: t.footer.subscribeSuccess });
      setEmail("");
      marquer("subscribed");
      window.setTimeout(() => setOuvert(false), 1600);
    } catch (err: unknown) {
      setMsg({
        ok: false,
        texte: err instanceof Error ? err.message : t.footer.subscribeError,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ouvert) return null;

  return (
    <div className="newsletter-popup" role="dialog" aria-modal="true" aria-labelledby="newsletter-popup-title">
      <button type="button" className="newsletter-popup__backdrop" aria-label={t.footer.popupDismiss} onClick={fermer} />
      <div className="newsletter-popup__card">
        <button type="button" className="newsletter-popup__close" onClick={fermer} aria-label={t.footer.popupDismiss}>
          <X className="size-4" />
        </button>
        <p className="kicker mb-3">{t.footer.newsletterTitle}</p>
        <h2 id="newsletter-popup-title" className="text-sm leading-relaxed text-white/80 md:text-base">
          {t.footer.newsletterText}
        </h2>
        <form onSubmit={envoyer} className="mt-6 space-y-3">
          <label className="sr-only" htmlFor="newsletter-popup-email">
            {t.footer.emailAria}
          </label>
          <input
            id="newsletter-popup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.footer.emailPlaceholder}
            className="newsletter-popup__input"
          />
          <button type="submit" disabled={loading} className="newsletter-popup__submit">
            {loading ? "…" : t.footer.subscribe}
          </button>
        </form>
        {msg ? (
          <p className={`mt-3 text-sm ${msg.ok ? "text-accent" : "text-red-400"}`}>{msg.texte}</p>
        ) : null}
        <button type="button" className="newsletter-popup__later" onClick={fermer}>
          {t.footer.popupDismiss}
        </button>
      </div>
    </div>
  );
}
