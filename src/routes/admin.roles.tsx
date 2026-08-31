import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/roles")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/roles" as "/admin/media/roles" });
  },
});
