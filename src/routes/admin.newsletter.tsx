import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/newsletter")({
  component: () => (
    <ModulePlaceholder
      titre="Newsletter"
      description="Abonnés et campagnes d'envoi éditorial."
      requis={["admin"]}
    />
  ),
});
