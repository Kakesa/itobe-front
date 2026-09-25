import { createFileRoute } from "@tanstack/react-router";
import { SectionComptabilite } from "@/components/comptabilite/section-vide";

export const Route = createFileRoute("/admin/comptabilite/caisse")({
  component: () => <SectionComptabilite section="caisse" />,
});
