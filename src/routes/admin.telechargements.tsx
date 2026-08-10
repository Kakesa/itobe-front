import { createFileRoute } from "@tanstack/react-router";
import { LecteurSectionPage } from "@/components/dashboard/lecteur-section-page";

export const Route = createFileRoute("/admin/telechargements")({
  component: () => <LecteurSectionPage section="telechargements" />,
});
