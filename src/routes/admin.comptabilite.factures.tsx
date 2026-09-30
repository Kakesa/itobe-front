import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/comptabilite/factures")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/comptabilite" });
  },
});
