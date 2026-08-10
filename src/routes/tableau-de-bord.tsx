import { createFileRoute, Navigate } from "@tanstack/react-router";
import { z } from "zod";

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
  if (onglet === "parametres" || onglet === "profil") {
    return <Navigate to="/admin/mon-profil" />;
  }
  return <Navigate to="/admin" />;
}
