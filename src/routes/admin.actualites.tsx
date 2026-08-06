import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/actualites")({
  component: () => (
    <ModulePlaceholder
      titre="Actualités"
      description="Publiez et programmez les actualités du portail Média."
      requis={["admin"]}
    />
  ),
});
