import { createFileRoute } from "@tanstack/react-router";
import { AccesRestreint } from "@/components/admin-ui";
import { MonProfilPanel } from "@/components/dashboard/mon-profil-panel";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/mon-profil")({
  component: AdminMonProfil,
});

function AdminMonProfil() {
  const { role } = useRole();
  if (role !== "admin" && role !== "editeur" && role !== "lecteur") {
    return <AccesRestreint requis={["admin", "editeur", "lecteur"]} />;
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Paramètres
        </p>
        <h2 className="mt-1 font-display text-3xl">Mon profil</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Informations personnelles, notifications et sécurité — disponible pour tous les comptes.
        </p>
      </div>
      <MonProfilPanel />
    </div>
  );
}
