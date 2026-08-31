import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminPortalLayout } from "@/components/admin/admin-portal-layout";
import { ADMIN_MENU_ICONS } from "@/lib/admin-icons";
import { menuEditionAdmin } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/edition")({
  component: EditionAdminLayout,
});

function EditionAdminLayout() {
  return (
    <AdminPortalLayout portal="edition" menu={menuEditionAdmin} iconMap={ADMIN_MENU_ICONS}>
      <Outlet />
    </AdminPortalLayout>
  );
}
