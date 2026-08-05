import { createFileRoute } from "@tanstack/react-router";
import { articles, categoriesLivres, categoriesMedia, livres } from "@/lib/data";
import { AccesRestreint, Actions, BarreOutils, Tableau } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const { role } = useRole();
  if (role === "vendeur") {
    return <AccesRestreint requis={["admin", "editeur", "redacteur"]} />;
  }

  return (
    <div className="space-y-12">
      <section>
        <BarreOutils titre="Catégories Média" action="Nouvelle catégorie" />
        <Tableau entetes={["Nom", "Articles", "Visibilité", ""]}>
          {categoriesMedia.map((c) => (
            <tr key={c}>
              <td className="px-4 py-3">{c}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {articles.filter((a) => a.categorie === c).length}
              </td>
              <td className="px-4 py-3 text-muted-foreground">Publique</td>
              <td className="px-4 py-3">
                <Actions />
              </td>
            </tr>
          ))}
        </Tableau>
      </section>

      <section>
        <BarreOutils titre="Catégories Édition" action="Nouvelle catégorie" />
        <Tableau entetes={["Nom", "Livres", "Visibilité", ""]}>
          {categoriesLivres.map((c) => (
            <tr key={c}>
              <td className="px-4 py-3">{c}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {livres.filter((l) => l.categorie === c).length}
              </td>
              <td className="px-4 py-3 text-muted-foreground">Publique</td>
              <td className="px-4 py-3">
                <Actions />
              </td>
            </tr>
          ))}
        </Tableau>
      </section>
    </div>
  );
}
