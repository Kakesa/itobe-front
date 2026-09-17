import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductionLanguageSwitcher } from "@/components/production/language-switcher";
import { ProductionLogo } from "@/components/production/logo";
import { useProductionCopy } from "@/lib/production/copy";

export function ProductionHeader() {
  const t = useProductionCopy();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isHeroPage = pathname === "/production" || pathname === "/production/about";
  const solidHeader = open || scrolled || !isHeroPage;
  const leftLinks = [
    { label: t.nav.work, to: "/production/work" as const },
    { label: t.nav.about, to: "/production/about" as const },
  ];
  const rightLinks = [{ label: t.nav.contact, to: "/production/contact" as const }];
  const links = [...leftLinks, ...rightLinks];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          solidHeader ? "bg-background/92 text-foreground backdrop-blur-md" : "text-hero-foreground"
        }`}
      >
        <div className="relative mx-auto flex h-20 max-w-screen-2xl items-center px-5 md:h-24 md:px-10 lg:px-14">
          <div className="relative z-10 flex min-w-0 flex-1 items-center">
            <Button
              variant="menu"
              size="icon"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={open}
              className="-ml-2 md:hidden"
            >
              {open ? <X /> : <Menu />}
            </Button>
            <nav className="hidden items-center gap-8 md:flex md:gap-10" aria-label={t.nav.primary}>
              {leftLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="nav-link text-xs uppercase"
                  activeProps={{ className: "nav-link text-xs uppercase is-active" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            to="/production"
            className="absolute left-1/2 z-10 -translate-x-1/2"
            aria-label={t.nav.home}
          >
            <ProductionLogo on={solidHeader ? "light" : "dark"} className="prod-logo--header" />
          </Link>
          <div className="relative z-10 flex min-w-0 flex-1 items-center justify-end gap-5 md:gap-10">
            <nav className="hidden items-center md:flex" aria-label={t.nav.contact}>
              {rightLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="nav-link text-xs uppercase"
                  activeProps={{ className: "nav-link text-xs uppercase is-active" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <ProductionLanguageSwitcher className="shrink-0" />
          </div>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background px-5 pt-28 pb-[max(2rem,env(safe-area-inset-bottom))] md:hidden">
          <nav className="flex flex-1 flex-col justify-center gap-6" aria-label={t.nav.mobile}>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block font-display text-5xl leading-none sm:text-6xl"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
