import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/seo")({
  component: () => (
    <ModulePlaceholder
      titre="SEO"
      description="Métadonnées, sitemaps et optimisation de référencement."
      requis={["admin"]}
    />
  ),
});
