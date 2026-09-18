import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/entreprise/")({
  beforeLoad: () => {
    throw redirect({ to: "/entreprise/about" });
  },
  component: () => null,
});
