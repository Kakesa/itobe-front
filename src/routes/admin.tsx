import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  Bookmark,
  ClipboardList,
  Clock,
  CreditCard,
  Download,
  FileText,
  FolderOpen,
  Heart,
  Image,
  LayoutDashboard,
  Library,
  Mail,
  Menu,
  MessageSquare,
  Newspaper,
  Percent,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Tag,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { menuAdmin } from "@/lib/admin-data";
import { useADesAchats } from "@/hooks/use-a-des-achats";
import { useRole } from "@/hooks/use-role";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace Itobe | Administration" },
      {
        name: "description",
        content:
          "Espace connecté Itobe : dashboard, contenus, lecture et paramètres selon votre rôle.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const ICONS: Record<string, typeof LayoutDashboard> = {
  Dashboard: LayoutDashboard,
  Articles: Newspaper,
  Actualités: FileText,
  Livres: BookOpen,
  Bibliothèque: Library,
  Favoris: Heart,
  Historique: Clock,
  Téléchargements: Download,
  "Marque-pages": Bookmark,
  "Mes achats": ShoppingBag,
  Auteurs: Users,
  Catégories: FolderOpen,
  Médiathèque: Image,
  Commandes: ClipboardList,
  Paiements: CreditCard,
  Coupons: Tag,
  Promotions: Percent,
  Utilisateurs: Users,
  Commentaires: MessageSquare,
  Newsletter: Mail,
  Rapports: FileText,
  Statistiques: BarChart3,
  Paramètres: Settings,
  Plateforme: Settings,
  "Mon profil": UserCircle,
  SEO: Search,
  "Rôles & Permissions": Shield,
};

function AdminLayout() {
  const { role } = useRole();
  useADesAchats();
  const { session, deconnexion } = useSession();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    deconnexion();
    void navigate({ to: "/connexion" });
  };

  const groupes = useMemo(
    () =>
      menuAdmin
        .map((g) => ({
          ...g,
          items: g.items.filter((i) => i.roles.includes(role)),
        }))
        .filter((g) => g.items.length > 0),
    [role],
  );

  const espaceLabel =
    role === "lecteur" ? "Espace lecteur" : role === "editeur" ? "Espace éditeur" : "Back-office";

  const SidebarNav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {groupes.map((g) => (
        <div key={g.groupe || "root"}>
          {g.groupe && (
            <p className="mb-2 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground/50">
              {g.groupe}
            </p>
          )}
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const Icon = ICONS[item.label] ?? BookMarked;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.to === "/admin" }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    activeProps={{
                      className:
                        "flex items-center gap-2.5 rounded-lg bg-accent px-2.5 py-2 text-sm font-medium text-accent-foreground shadow-soft",
                    }}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const chromeSidebar =
    "bg-[linear-gradient(180deg,var(--primary),color-mix(in_oklab,var(--terracotta)_38%,var(--primary)))] text-primary-foreground";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside
        className={`sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-primary/40 md:flex ${chromeSidebar}`}
      >
        <div className="border-b border-primary-foreground/15 px-4 py-4">
          <Link to="/" className="font-display text-xl tracking-tight">
            Itobe<span className="text-ochre">.</span>
          </Link>
          <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-primary-foreground/60">
            {espaceLabel}
          </p>
        </div>
        {SidebarNav}
        <div className="space-y-2 border-t border-primary-foreground/15 p-3">
          {session && (
            <div className="px-1 text-xs text-primary-foreground/60">
              <p className="font-medium text-primary-foreground">
                {session.prenom} {session.nom}
              </p>
              <p className="truncate">{session.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg border border-primary-foreground/25 px-3 py-2 text-xs text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:hidden">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg border border-border"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu className="size-4" />
          </button>
          <p className="font-display text-lg">
            Itobe<span className="text-accent">.</span>
          </p>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              aria-label="Fermer"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className={`absolute inset-y-0 left-0 flex w-72 flex-col shadow-xl ${chromeSidebar}`}
            >
              <div className="flex items-center justify-between border-b border-primary-foreground/15 px-4 py-4">
                <p className="font-display text-xl">
                  Itobe<span className="text-ochre">.</span>
                </p>
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-lg border border-primary-foreground/25"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="size-4" />
                </button>
              </div>
              {SidebarNav}
            </aside>
          </div>
        )}

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
