import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/coupons")({
  component: () => (
    <ModulePlaceholder
      titre="Coupons"
      description="Créez et suivez les codes promo de la plateforme."
      requis={["admin"]}
    />
  ),
});
