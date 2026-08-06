import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/commentaires")({
  component: () => (
    <ModulePlaceholder
      titre="Commentaires"
      description="Modération des commentaires articles et livres."
      requis={["admin"]}
    />
  ),
});
