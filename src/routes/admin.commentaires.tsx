import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/commentaires")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/commentaires" as "/admin/media/commentaires" });
  },
});
