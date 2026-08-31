import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/statistiques")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/statistiques" as "/admin/media/statistiques" });
  },
});
