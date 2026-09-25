import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminPortalLayout } from "@/components/admin/admin-portal-layout";
import { AccesRestreint } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";
import { menuComptabiliteAdmin } from "@/lib/admin-data";
import { ADMIN_MENU_ICONS } from "@/lib/admin-icons";

export const Route = createFileRoute("/admin/comptabilite")({
  component: ComptabiliteLayout,
});

function ComptabiliteLayout() {
  const { role } = useRole();
  if (role !== "admin" && role !== "comptable") {
    return <AccesRestreint requis={["admin", "comptable"]} />;
  }
  return (
    <AdminPortalLayout portal="comptabilite" menu={menuComptabiliteAdmin} iconMap={ADMIN_MENU_ICONS}>
      <Outlet />
    </AdminPortalLayout>
  );
}
