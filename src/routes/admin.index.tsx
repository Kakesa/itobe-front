import { createFileRoute, Link } from "@tanstack/react-router";
import { articles, livres, auteurs, statsDashboard } from "@/lib/data";
import { commandes, sectionsAdmin } from "@/lib/admin-data";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const { role } = useRole();
  const visibles = sectionsAdmin.filter((s) => s.roles.includes(role) && s.to !== "/admin");
  const enAttente = commandes.filter((c) => c.statut === "En attente").length;

  const cartes = [
    { label: "Articles", valeur: String(articles.length) },
    { label: "Livres", valeur: String(livres.length) },
    { label: "Auteurs", valeur: String(auteurs.length) },
    { label: "Commandes à traiter", valeur: String(enAttente) },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cartes.map((c) => (
          <div key={c.label} className="rounded-sm border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-3xl">{c.valeur}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl">Vos espaces</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {visibles.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="rounded-sm border border-border bg-card p-5 transition-colors hover:border-accent"
          >
            <p className="font-display text-lg">{s.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Créer, modifier et publier depuis l'interface.
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 text-2xl">Indicateurs</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsDashboard.slice(0, 4).map((s) => (
          <div key={s.label} className="rounded-sm border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-2xl">{s.valeur}</p>
            <p className="mt-1 text-xs text-accent">{s.delta}</p>
          </div>
        ))}
      </div>
      <Link to="/tableau-de-bord" className="mt-6 inline-block text-sm text-accent hover:underline">
        Voir le tableau de bord complet →
      </Link>
    </div>
  );
}
