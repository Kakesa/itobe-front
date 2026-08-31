import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/rapports")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/rapports" as "/admin/media/rapports" });
  },
});
