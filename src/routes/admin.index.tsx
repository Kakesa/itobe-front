import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRole } from "@/hooks/use-role";
import { LecteurDashboard } from "@/components/dashboard/lecteur-dashboard";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  const { role } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "admin") {
      void navigate({ to: "/admin/media", replace: true });
    } else if (role === "editeur") {
      void navigate({ to: "/admin/edition", replace: true });
    }
  }, [role, navigate]);

  if (role === "lecteur") {
    return <LecteurDashboard />;
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Redirection vers votre espace…
    </div>
  );
}
