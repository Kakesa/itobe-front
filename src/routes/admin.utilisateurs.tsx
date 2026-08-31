import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/utilisateurs")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/utilisateurs" as "/admin/media/utilisateurs" });
  },
});
