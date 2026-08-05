import { createFileRoute } from "@tanstack/react-router";
import { articles, auteurs, livres } from "@/lib/data";
import { AccesRestreint, Actions, BarreOutils, Tableau } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/auteurs")({
  component: AdminAuteurs,
});

function AdminAuteurs() {
  const { role } = useRole();
  if (role !== "admin" && role !== "editeur") {
    return <AccesRestreint requis={["admin", "editeur"]} />;
  }

  return (
    <div>
      <BarreOutils titre="Auteurs" action="Ajouter un auteur" />
      <Tableau entetes={["Nom", "Rôle", "Ville", "Livres", "Articles", "Ventes", ""]}>
        {auteurs.map((a) => (
          <tr key={a.slug}>
            <td className="px-4 py-3">{a.nom}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.role}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.ville}</td>
            <td className="px-4 py-3">{livres.filter((l) => l.auteur === a.slug).length}</td>
            <td className="px-4 py-3">{articles.filter((x) => x.auteur === a.slug).length}</td>
            <td className="px-4 py-3">{a.ventes.toLocaleString("fr-FR")}</td>
            <td className="px-4 py-3">
              <Actions />
            </td>
          </tr>
        ))}
      </Tableau>
    </div>
  );
}
