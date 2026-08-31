import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/commandes")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/edition/commandes" as "/admin/edition/commandes" });
  },
});
