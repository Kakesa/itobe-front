import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, ExternalLink, Landmark, LayoutDashboard, Menu, Newspaper, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { Role } from "@/lib/admin-data";
import { useSession } from "@/hooks/use-session";
import { useRole } from "@/hooks/use-role";

export type AdminPortal = "media" | "edition" | "lecteur" | "comptabilite";

type MenuItem = { to: string; label: string; roles: Role[] };
type MenuGroup = { groupe: string; items: MenuItem[] };

const PORTAL_META: Record<
  AdminPortal,
  {
    label: string;
    subtitle: string;
    icon: typeof Newspaper;
    sidebarClass: string;
    accentClass: string;
    badgeClass: string;
    publicLink: string;
    publicLabel: string;
  }
> = {
  media: {
    label: "Admin Média",
    subtitle: "Contenus · Newsletter · Audience",
    icon: Newspaper,
    sidebarClass: "admin-portal-sidebar text-white",
    accentClass: "admin-portal-accent",
    badgeClass: "admin-portal-badge",
    publicLink: "/media",
    publicLabel: "Retour au site",
  },
  edition: {
    label: "Admin Édition",
    subtitle: "Catalogue · Ventes · Promotions",
    icon: BookOpen,
    sidebarClass: "admin-portal-sidebar text-white",
    accentClass: "admin-portal-accent",
    badgeClass: "admin-portal-badge",
    publicLink: "/edition",
    publicLabel: "Retour au site",
  },
  lecteur: {
    label: "Espace lecteur",
    subtitle: "Bibliothèque · Lecture · Achats",
    icon: BookOpen,
    sidebarClass: "admin-portal-sidebar text-white",
    accentClass: "bg-accent text-accent-foreground",
    badgeClass: "bg-primary-foreground/15 text-primary-foreground/80",
    publicLink: "/edition",
    publicLabel: "Retour au site",
  },
  comptabilite: {
    label: "Comptabilité",
    subtitle: "Factures · Trésorerie · Rapports",
    icon: Landmark,
    sidebarClass: "admin-portal-sidebar text-white",
    accentClass: "admin-portal-accent",
    badgeClass: "admin-portal-badge",
    publicLink: "/",
    publicLabel: "Retour au site",
  },
};

const ICONS: Record<string, typeof LayoutDashboard> = {
  Dashboard: LayoutDashboard,
};

type Props = {
  portal: AdminPortal;
  menu: MenuGroup[];
  iconMap?: Record<string, typeof LayoutDashboard>;
  children: ReactNode;
};

export function AdminPortalLayout({ portal, menu, iconMap = {}, children }: Props) {
  const meta = PORTAL_META[portal];
  const PortalIcon = meta.icon;
  const { role } = useRole();
  const { session, deconnexion } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const groupes = useMemo(
    () =>
      menu
        .map((g) => ({
          ...g,
          items: g.items.filter((i) => portal === "edition" || i.roles.includes(role)),
        }))
        .filter((g) => g.items.length > 0),
    [menu, role],
  );

  const logout = () => {
    deconnexion();
    void navigate({ to: "/connexion" });
  };

  const isActive = (to: string) => {
    if (to.endsWith("/") || to.match(/\/admin\/(media|edition|comptabilite)$/)) {
      return pathname === to || pathname === `${to}/`;
    }
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const profilPath =
    portal === "media"
      ? "/admin/media/mon-profil"
      : portal === "edition"
        ? "/admin/edition/mon-profil"
        : portal === "comptabilite"
          ? "/admin/comptabilite/mon-profil"
          : "/admin/mon-profil";

  const SidebarNav = (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
      {groupes.map((g) => (
        <div key={g.groupe || "root"}>
          {g.groupe && (
            <p className="mb-2 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] opacity-50">
              {g.groupe}
            </p>
          )}
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const Icon = iconMap[item.label] ?? ICONS[item.label] ?? LayoutDashboard;
              const active = isActive(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={
                      /\/admin\/(media|edition|comptabilite)$/.test(item.to) || item.to === "/admin"
                        ? { exact: true }
                        : undefined
                    }
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      active
                        ? `${meta.accentClass} font-medium shadow-md`
                        : "opacity-75 hover:bg-white/10 hover:opacity-100"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const sidebarInner = (
    <>
      <div className="border-b border-white/10 px-4 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className={`grid size-9 place-items-center rounded-sm ${meta.accentClass}`}>
            <PortalIcon className="size-4" />
          </span>
          <span>
            <span className="block font-display text-lg leading-none tracking-wide">ITOBE</span>
            <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.14em] opacity-60">
              {meta.label}
            </span>
          </span>
        </Link>
        <p className="mt-3 text-xs opacity-70">{meta.subtitle}</p>
      </div>
      {SidebarNav}
      <div className="space-y-2 border-t border-white/10 p-3">
        <Link
          to={meta.publicLink}
          className="block rounded-lg border border-white/15 px-3 py-2 text-center text-xs opacity-80 hover:bg-white/10 hover:opacity-100"
        >
          {meta.publicLabel}
        </Link>
        {session && (
          <div className="px-1 text-xs opacity-60">
            <p className="font-medium opacity-100">
              {session.prenom} {session.nom}
            </p>
            <p className="truncate">{session.email}</p>
          </div>
        )}
        <Link
          to={profilPath}
          className="block rounded-lg px-3 py-2 text-center text-xs opacity-80 hover:bg-white/10"
        >
          Mon profil
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-lg border border-white/20 px-3 py-2 text-xs opacity-75 hover:bg-white/10 hover:opacity-100"
        >
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className={`admin-portal admin-portal--${portal} flex min-h-screen bg-muted/40`}>
      <aside
        className={`sticky top-0 hidden h-svh w-[17.5rem] shrink-0 flex-col md:flex ${meta.sidebarClass}`}
      >
        {sidebarInner}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`admin-portal-header sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur md:px-8 ${
            portal === "lecteur" ? "border-border bg-card/95" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid size-9 place-items-center rounded-lg border border-border md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu className="size-4" />
            </button>
            <span className={`hidden rounded-sm px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider md:inline ${meta.badgeClass}`}>
              {meta.label}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              to={meta.publicLink}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ExternalLink className="size-3.5 shrink-0" aria-hidden />
              {meta.publicLabel}
            </Link>
          </div>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/50"
              aria-label="Fermer"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className={`absolute inset-y-0 left-0 flex w-72 flex-col shadow-xl ${meta.sidebarClass}`}
            >
              <div className="flex justify-end p-2">
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-lg border border-white/20"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="size-4" />
                </button>
              </div>
              {sidebarInner}
            </aside>
          </div>
        )}

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
