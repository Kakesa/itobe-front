import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { AdminPortalLayout } from "@/components/admin/admin-portal-layout";
import { useADesAchats } from "@/hooks/use-a-des-achats";
import { menuLecteurAdmin } from "@/lib/admin-data";
import { ADMIN_MENU_ICONS } from "@/lib/admin-icons";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace Itobe | Administration" },
      {
        name: "description",
        content: "Espace connecté Itobe : Média, Édition ou lecteur selon votre rôle.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  useADesAchats();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname.startsWith("/admin/media") || pathname.startsWith("/admin/edition")) {
    return <Outlet />;
  }

  return (
    <AdminPortalLayout portal="lecteur" menu={menuLecteurAdmin} iconMap={ADMIN_MENU_ICONS}>
      <Outlet />
    </AdminPortalLayout>
  );
}
