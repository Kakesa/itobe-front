import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/calendrier")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/calendrier" as "/admin/media/calendrier" });
  },
});
