/* eslint-disable @typescript-eslint/prefer-as-const */
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/articles")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/media/articles" as "/admin/media/articles" });
  },
});
