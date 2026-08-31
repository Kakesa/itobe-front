import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/edition/statistiques")({
  component: () => (
    <ModulePlaceholder
      titre="Statistiques"
      description="Indicateurs détaillés et filtres avancés."
      requis={["admin", "editeur"]}
    />
  ),
});
