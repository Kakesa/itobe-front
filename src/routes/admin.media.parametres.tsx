import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/media/parametres")({
  component: () => (
    <ModulePlaceholder
      titre="Paramètres"
      description="Configuration générale de la plateforme Itobe."
      requis={["admin"]}
    />
  ),
});
