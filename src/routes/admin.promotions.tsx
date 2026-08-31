import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/promotions")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/edition/promotions" as "/admin/edition/promotions" });
  },
});
