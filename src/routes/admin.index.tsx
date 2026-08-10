import { createFileRoute } from "@tanstack/react-router";
import { useRole } from "@/hooks/use-role";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { EditeurDashboard } from "@/components/dashboard/editeur-dashboard";
import { LecteurDashboard } from "@/components/dashboard/lecteur-dashboard";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const { role } = useRole();

  if (role === "lecteur") {
    return <LecteurDashboard />;
  }
  if (role === "editeur") {
    return <EditeurDashboard />;
  }
  return <AdminDashboard />;
}
