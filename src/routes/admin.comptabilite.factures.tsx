import { createFileRoute } from "@tanstack/react-router";
import { SectionComptabilite } from "@/components/comptabilite/section-vide";

export const Route = createFileRoute("/admin/comptabilite/factures")({
  component: () => <SectionComptabilite section="factures" />,
});
