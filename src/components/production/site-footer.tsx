import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useProductionCopy } from "@/lib/production/copy";

export function ProductionFooter() {
  const t = useProductionCopy();

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-screen-2xl px-5 py-16 md:px-10 md:py-24 lg:px-14">
        <div className="grid gap-16 border-b border-footer-border pb-16 md:grid-cols-2 md:items-end">
          <Link to="/production" className="font-display text-6xl uppercase tracking-brand sm:text-8xl">
            Itobe
          </Link>
          <p className="max-w-sm text-sm leading-7 text-footer-muted md:justify-self-end">
            {t.footer.tagline}
            <br />
            {t.footer.places}
          </p>
        </div>
        <div className="grid gap-10 pt-10 text-xs uppercase md:grid-cols-3">
          <nav className="flex flex-wrap gap-x-7 gap-y-3" aria-label={t.nav.footer}>
            <Link to="/production/work">{t.nav.work}</Link>
            <Link to="/production/about">{t.nav.about}</Link>
            <Link to="/production/contact">{t.nav.contact}</Link>
          </nav>
          <div className="flex flex-wrap gap-x-7 gap-y-3 md:justify-center">
            {["Instagram", "LinkedIn", "YouTube"].map((label) => (
              <a
                key={label}
                href={`https://${label.toLowerCase()}.com`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1"
              >
                {label}
                <ArrowUpRight className="size-3" />
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3 text-footer-muted md:items-end">
            <Link to="/" className="inline-flex items-center gap-1.5 normal-case">
              <ArrowLeft className="size-3" />
              {t.nav.backToPortals}
            </Link>
            <p>© {new Date().getFullYear()} Itobe Production</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
