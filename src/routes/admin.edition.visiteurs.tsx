import { createFileRoute } from "@tanstack/react-router";
import { VisiteursAdminPage } from "./admin.media.visiteurs";

export const Route = createFileRoute("/admin/edition/visiteurs")({
  component: VisiteursAdminPage,
});
