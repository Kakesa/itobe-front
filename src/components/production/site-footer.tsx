import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ProductionLogo } from "@/components/production/logo";
import { useProductionCopy } from "@/lib/production/copy";

export function ProductionFooter() {
  const t = useProductionCopy();

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-screen-2xl px-5 py-16 md:px-10 md:py-24 lg:px-14">
        <div className="grid gap-16 border-b border-footer-border pb-16 md:grid-cols-2 md:items-end">
          <Link to="/production" className="inline-block w-fit" aria-label={t.nav.home}>
            <ProductionLogo on="dark" className="prod-logo--footer" />
          </Link>
          <div className="md:justify-self-end">
            <p className="max-w-sm text-sm leading-7 text-footer-muted">
              {t.footer.tagline}
              <br />
              {t.footer.places}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 border border-footer-border px-3.5 py-2 text-xs font-semibold uppercase tracking-brand text-footer-foreground transition hover:border-footer-foreground/40"
            >
              <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
              {t.nav.backToPortals}
            </Link>
          </div>
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
          <p className="text-footer-muted md:text-right">© {new Date().getFullYear()} Itobe Production</p>
        </div>
      </div>
    </footer>
  );
}
