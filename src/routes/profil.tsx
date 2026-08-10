import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil | Itobe" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Navigate to="/admin/mon-profil" />,
});
