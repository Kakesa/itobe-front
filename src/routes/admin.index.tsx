import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRole } from "@/hooks/use-role";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { EditeurDashboard } from "@/components/dashboard/editeur-dashboard";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const { role } = useRole();

  if (role === "lecteur") {
    return <Navigate to="/admin" />;
  }
  if (role === "editeur") {
    return <EditeurDashboard />;
  }
  return <AdminDashboard />;
}
