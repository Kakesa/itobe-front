import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminPortalLayout } from "@/components/admin/admin-portal-layout";
import { useADesAchats } from "@/hooks/use-a-des-achats";
import { useRole } from "@/hooks/use-role";
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
  const { role } = useRole();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (role === "comptable" && !pathname.startsWith("/admin/comptabilite")) {
      void navigate({ to: "/admin/comptabilite", replace: true });
    }
  }, [role, pathname, navigate]);

  if (
    pathname.startsWith("/admin/media") ||
    pathname.startsWith("/admin/edition") ||
    pathname.startsWith("/admin/comptabilite")
  ) {
    return <Outlet />;
  }

  return (
    <AdminPortalLayout portal="lecteur" menu={menuLecteurAdmin} iconMap={ADMIN_MENU_ICONS}>
      <Outlet />
    </AdminPortalLayout>
  );
}
