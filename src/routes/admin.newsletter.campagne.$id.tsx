import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/newsletter/campagne/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/admin/media/newsletter/campagne/$id",
      params: { id: params.id },
    });
  },
});
