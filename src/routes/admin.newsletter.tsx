import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { AccesRestreint } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/newsletter")({
  component: NewsletterLayout,
});

const ONGLETS = [
  { to: "/admin/newsletter", label: "Vue d'ensemble", exact: true },
  { to: "/admin/newsletter/abonnes", label: "Abonnés" },
  { to: "/admin/newsletter/campagnes", label: "Campagnes" },
  { to: "/admin/newsletter/templates", label: "Templates" },
];

function NewsletterLayout() {
  const { role } = useRole();
  if (role !== "admin") return <AccesRestreint requis={["admin"]} />;

  return (
    <div>
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Communication
        </p>
        <h1 className="mt-1 font-display text-3xl">Newsletters</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Abonnés, campagnes, templates et statistiques d&apos;envoi.
        </p>
      </header>

      <nav className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
        {ONGLETS.map((o) => (
          <Link
            key={o.to}
            to={o.to}
            activeOptions={{ exact: o.exact ?? false }}
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

      <Outlet />
    </div>
  );
}
