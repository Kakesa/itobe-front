import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";

export const Route = createFileRoute("/admin/medias")({
  component: () => (
    <ModulePlaceholder
      titre="Médias"
      description="Galerie d'images et vidéos pour articles et livres."
      requis={["admin"]}
    />
  ),
});
