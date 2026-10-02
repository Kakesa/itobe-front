import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";

export const Route = createFileRoute("/admin/media/categories")({
  component: AdminCategoriesMedia,
});

const champs = [
  { nom: "nom", label: "Nom", requis: true },
  { nom: "visibilite", label: "Visibilité", type: "select" as const, options: ["Publique", "Privée"] },
];

const colonnes = [
  { cle: "nom", label: "Nom" },
  { cle: "visibilite", label: "Visibilité", classe: "text-muted-foreground" },
];

function AdminCategoriesMedia() {
  return (
    <CrudModule
      titre="Catégories Média"
      singulier="Catégorie Média"
      description="Ces catégories alimentent les filtres du portail Média. Seules les catégories publiques y apparaissent."
      collection="categoriesMedia"
      requis={["admin"]}
      clesRecherche={["nom"]}
      colonnes={colonnes}
      champs={champs}
    />
  );
}
