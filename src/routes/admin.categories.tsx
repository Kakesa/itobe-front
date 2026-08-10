import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

const champs = [
  { nom: "nom", label: "Nom", requis: true },
  { nom: "visibilite", label: "Visibilité", type: "select" as const, options: ["Publique", "Privée"] },
];

const colonnes = [
  { cle: "nom", label: "Nom" },
  { cle: "visibilite", label: "Visibilité", classe: "text-muted-foreground" },
];

function AdminCategories() {
  return (
    <div className="space-y-12">
      <CrudModule
        titre="Catégories Média"
        singulier="Catégorie Média"
        collection="categoriesMedia"
        requis={["admin", "editeur"]}
        clesRecherche={["nom"]}
        colonnes={colonnes}
        champs={champs}
      />
      <CrudModule
        titre="Catégories Édition"
        singulier="Catégorie Édition"
        collection="categoriesLivres"
        requis={["admin", "editeur"]}
        clesRecherche={["nom"]}
        colonnes={colonnes}
        champs={champs}
      />
    </div>
  );
}
