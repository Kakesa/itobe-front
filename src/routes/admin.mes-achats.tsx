/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { LecteurSectionPage } from "@/components/dashboard/lecteur-section-page";

export const Route = createFileRoute("/admin/mes-achats")({
  component: () => <LecteurSectionPage section="mes-achats" />,
});
