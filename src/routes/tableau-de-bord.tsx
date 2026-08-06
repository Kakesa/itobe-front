import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRole } from "@/hooks/use-role";
import { LecteurDashboard } from "@/components/dashboard/lecteur-dashboard";

export const Route = createFileRoute("/tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Tableau de bord | Itobe" },
      {
        name: "description",
        content: "Espace personnel et tableaux de bord Itobe selon votre rôle.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TableauDeBord,
});

function TableauDeBord() {
  const { role } = useRole();

  // Admin & Éditeur → back-office unifié
  if (role === "admin" || role === "editeur") {
    return <Navigate to="/admin" />;
  }

  // Lecteur → dashboard personnel (aussi accessible via /admin)
  return (
    <div className="min-h-screen bg-background">
      <LecteurDashboard />
    </div>
  );
}
