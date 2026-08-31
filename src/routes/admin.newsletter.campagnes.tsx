import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/newsletter/campagnes")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/newsletter/campagnes" as "/admin/media/newsletter/campagnes" });
  },
});
