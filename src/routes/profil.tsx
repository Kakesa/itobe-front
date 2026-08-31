import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRole } from "@/hooks/use-role";
import { destinationMonProfil } from "@/lib/redirect-navigation";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil | Itobe" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilRedirect,
});

function ProfilRedirect() {
  const { role } = useRole();
  return <Navigate to={destinationMonProfil(role)} />;
}
