import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/medias")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/medias" as "/admin/media/medias" });
  },
});
