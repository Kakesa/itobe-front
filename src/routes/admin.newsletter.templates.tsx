import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/newsletter/templates")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/newsletter/templates" as "/admin/media/newsletter/templates" });
  },
});
