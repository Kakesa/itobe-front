import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/promotions")({
  component: () => (
    <ModulePlaceholder
      titre="Promotions"
      description="Gérez les promotions catalogue et campagnes saisonnières."
      requis={["admin"]}
    />
  ),
});
