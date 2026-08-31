import { createFileRoute } from "@tanstack/react-router";
import { AbonnesPanel } from "@/components/newsletter/abonnes-panel";

export const Route = createFileRoute("/admin/media/newsletter/abonnes")({
  component: () => <AbonnesPanel />,
});
