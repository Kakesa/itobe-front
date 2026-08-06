import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/rapports")({
  component: () => (
    <ModulePlaceholder
      titre="Rapports"
      description="Exports et rapports d'activité Média + Édition."
      requis={["admin", "editeur"]}
    />
  ),
});
