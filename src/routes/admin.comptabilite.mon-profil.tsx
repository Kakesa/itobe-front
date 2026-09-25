import { createFileRoute } from "@tanstack/react-router";
import { AccesRestreint } from "@/components/admin-ui";
import { MonProfilPage } from "@/components/dashboard/mon-profil-page";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/comptabilite/mon-profil")({
  component: ComptabiliteMonProfil,
});

function ComptabiliteMonProfil() {
  const { role } = useRole();
  if (role !== "admin" && role !== "comptable") {
    return <AccesRestreint requis={["admin", "comptable"]} />;
  }
  return <MonProfilPage />;
}
