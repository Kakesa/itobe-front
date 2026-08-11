import { createFileRoute, Navigate } from "@tanstack/react-router";

/** Ancienne URL — redirige vers l'onglet Campagnes. */
export const Route = createFileRoute("/admin/newsletter/campagnes")({
  component: () => <Navigate to="/admin/newsletter" />,
});
