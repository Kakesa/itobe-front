import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { roles, sectionsAdmin } from "@/lib/admin-data";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panneau d'administration | Itobe" },
      {
        name: "description",
        content:
          "Gérez les articles, livres, catégories, auteurs et commandes d'Itobe depuis une interface unique avec navigation par rôles.",
      },
      { property: "og:title", content: "Panneau d'administration | Itobe" },
      { property: "og:description", content: "Contenus, catalogue et ventes en un seul endroit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { role, changerRole } = useRole();
  const actif = roles.find((r) => r.id === role);
  const visibles = sectionsAdmin.filter((s) => s.roles.includes(role));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="kicker">Administration</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Panneau de gestion</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        {actif?.description}
      </p>

      <div className="mt-8 rounded-sm border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Rôle actif
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => changerRole(r.id)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                role === r.id
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
        {visibles.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            activeOptions={{ exact: s.to === "/admin" }}
            className="rounded-sm px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground font-medium" }}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
