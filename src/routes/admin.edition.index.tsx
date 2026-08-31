import { createFileRoute } from "@tanstack/react-router";
import { EditionAdminDashboard } from "@/components/dashboard/edition-admin-dashboard";

export const Route = createFileRoute("/admin/edition/")({
  component: EditionAdminDashboard,
});
