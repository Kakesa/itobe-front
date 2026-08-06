import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/utilisateurs")({
  component: () => (
    <ModulePlaceholder
      titre="Utilisateurs"
      description="Comptes lecteurs, éditeurs et administrateurs."
      requis={["admin"]}
    />
  ),
});
