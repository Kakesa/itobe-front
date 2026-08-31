import { createFileRoute } from "@tanstack/react-router";
import { CommandesAdminPanel } from "@/components/admin/commandes-panel";

export const Route = createFileRoute("/admin/edition/commandes")({
  component: () => <CommandesAdminPanel />,
});
