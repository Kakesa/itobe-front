import { createFileRoute } from "@tanstack/react-router";
import { MediaAdminDashboard } from "@/components/dashboard/media-admin-dashboard";

export const Route = createFileRoute("/admin/media/")({
  component: MediaAdminDashboard,
});
