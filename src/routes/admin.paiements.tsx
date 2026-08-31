import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/paiements")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/edition/paiements" as "/admin/edition/paiements" });
  },
});
