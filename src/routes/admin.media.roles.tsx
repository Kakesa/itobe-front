import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/media/roles")({
  component: () => (
    <ModulePlaceholder
      titre="Rôles & Permissions"
      description="Matrice des droits ADMIN, ÉDITEUR et LECTEUR."
      requis={["admin"]}
    />
  ),
});
