import { createFileRoute } from "@tanstack/react-router";
import { LecteurSectionPage } from "@/components/dashboard/lecteur-section-page";

export const Route = createFileRoute("/admin/historique")({
  component: () => <LecteurSectionPage section="historique" />,
});
