import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LecteurSectionPage } from "@/components/dashboard/lecteur-section-page";
import { useADesAchats } from "@/hooks/use-a-des-achats";

export const Route = createFileRoute("/admin/ma-bibliotheque")({
  component: AdminMaBibliotheque,
});

function AdminMaBibliotheque() {
  const navigate = useNavigate();
  const { aDesAchats, loading } = useADesAchats();

  useEffect(() => {
    if (loading) return;
    if (!aDesAchats) {
      void navigate({ to: "/admin", replace: true });
    }
  }, [loading, aDesAchats, navigate]);

  if (loading || !aDesAchats) return null;

  return <LecteurSectionPage section="bibliotheque" />;
}
