import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/coupons")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/edition/coupons" as "/admin/edition/coupons" });
  },
});
