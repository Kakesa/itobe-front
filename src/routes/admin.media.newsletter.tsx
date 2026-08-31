import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { AccesRestreint } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/media/newsletter")({
  component: NewsletterLayout,
});

const NAV = [
  { to: "/admin/media/newsletter", label: "Campagnes", exact: true },
  { to: "/admin/media/newsletter/abonnes", label: "Abonnés", exact: false },
  { to: "/admin/media/newsletter/templates", label: "Templates", exact: false },
] as const;

function NewsletterLayout() {
  const { role } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (role !== "admin") return <AccesRestreint requis={["admin"]} />;

  // Détail d'une campagne : pas de nav (focus édition)
  const detailCampagne = pathname.includes("/newsletter/campagne/");

  return (
    <div>
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Communication
        </p>
        <h1 className="mt-1 font-display text-3xl">Newsletter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Campagnes, notifications et abonnés. La publication d&apos;un article ou d&apos;un livre
          notifie automatiquement tous les abonnés actifs.
        </p>
      </header>

      {!detailCampagne && (
        <nav className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
          {NAV.map((o) => (
            <Link
              key={o.to}
              to={o.to}
              activeOptions={{ exact: o.exact }}
              className="rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{
                className:
                  "rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground",
              }}
            >
              {o.label}
            </Link>
          ))}
        </nav>
      )}

      <Outlet />
    </div>
  );
}
