import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminPortalLayout } from "@/components/admin/admin-portal-layout";
import { ADMIN_MENU_ICONS } from "@/lib/admin-icons";
import { menuMediaAdmin } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/media")({
  component: MediaAdminLayout,
});

function MediaAdminLayout() {
  return (
    <AdminPortalLayout portal="media" menu={menuMediaAdmin} iconMap={ADMIN_MENU_ICONS}>
      <Outlet />
    </AdminPortalLayout>
  );
}
