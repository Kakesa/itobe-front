import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/actualites")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/actualites" as "/admin/media/actualites" });
  },
});
