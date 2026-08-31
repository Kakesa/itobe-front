import { createFileRoute, Navigate } from "@tanstack/react-router";
import { z } from "zod";
import { useRole } from "@/hooks/use-role";
import { destinationMonProfil } from "@/lib/redirect-navigation";

const searchSchema = z.object({
  onglet: z.enum(["dashboard", "parametres", "profil"]).optional(),
});

export const Route = createFileRoute("/tableau-de-bord")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Tableau de bord | Itobe" },
      {
        name: "description",
        content: "Espace personnel Itobe — redirection vers l'espace connecté.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TableauDeBord,
});

function TableauDeBord() {
  const { onglet } = Route.useSearch();
  const { role } = useRole();
  if (onglet === "parametres" || onglet === "profil") {
    return <Navigate to={destinationMonProfil(role)} />;
  }
  return <Navigate to="/admin" />;
}
