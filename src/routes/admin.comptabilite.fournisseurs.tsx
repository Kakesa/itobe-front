import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/comptabilite/fournisseurs")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/comptabilite" });
  },
});
