import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/livres")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/edition/livres" as "/admin/edition/livres" });
  },
});
