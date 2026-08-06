import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/paiements")({
  component: () => (
    <ModulePlaceholder
      titre="Paiements"
      description="Suivi des transactions Mobile Money et cartes bancaires."
      requis={["admin"]}
    />
  ),
});
