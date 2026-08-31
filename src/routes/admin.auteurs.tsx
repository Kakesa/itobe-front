import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/auteurs")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/edition/auteurs" as "/admin/edition/auteurs" });
  },
});
