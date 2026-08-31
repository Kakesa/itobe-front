import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/parametres")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/parametres" as "/admin/media/parametres" });
  },
});
