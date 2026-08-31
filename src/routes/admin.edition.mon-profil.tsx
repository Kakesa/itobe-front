import { createFileRoute } from "@tanstack/react-router";
import { AccesRestreint } from "@/components/admin-ui";
import { MonProfilPage } from "@/components/dashboard/mon-profil-page";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/edition/mon-profil")({
  component: EditionMonProfil,
});

function EditionMonProfil() {
  const { role } = useRole();
  if (role !== "admin" && role !== "editeur") {
    return <AccesRestreint requis={["admin", "editeur"]} />;
  }
  return <MonProfilPage />;
}
