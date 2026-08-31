import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AccesRestreint } from "@/components/admin-ui";
import { MonProfilPage } from "@/components/dashboard/mon-profil-page";
import { useRole } from "@/hooks/use-role";
import { destinationMonProfil } from "@/lib/redirect-navigation";

export const Route = createFileRoute("/admin/mon-profil")({
  component: AdminMonProfil,
});

function AdminMonProfil() {
  const { role } = useRole();

  if (role === "admin" || role === "editeur") {
    return <Navigate to={destinationMonProfil(role)} replace />;
  }

  if (role !== "lecteur") {
    return <AccesRestreint requis={["admin", "editeur", "lecteur"]} />;
  }

  return <MonProfilPage />;
}
