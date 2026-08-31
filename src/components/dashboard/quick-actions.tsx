import { Link } from "@tanstack/react-router";
import {
  BookPlus,
  FolderPlus,
  Newspaper,
  Percent,
  Tag,
  UserPlus,
  Mail,
} from "lucide-react";
import { SectionCard } from "./ui";

const actions = [
  { to: "/admin/media/articles", label: "Nouvel article", icon: Newspaper },
  { to: "/admin/edition/livres", label: "Nouveau livre", icon: BookPlus },
  { to: "/admin/media/categories", label: "Catégorie média", icon: FolderPlus },
  { to: "/admin/edition/auteurs", label: "Nouvel auteur", icon: UserPlus },
  { to: "/admin/edition/promotions", label: "Nouvelle promotion", icon: Percent },
  { to: "/admin/edition/coupons", label: "Nouveau coupon", icon: Tag },
  { to: "/admin/media/newsletter", label: "Nouvelle Newsletter", icon: Mail },
] as const;

export function QuickActions() {
  return (
    <SectionCard titre="Actions rapides">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {actions.map((a) => (
          <Link
            key={a.to + a.label}
            to={a.to}
            className="flex flex-col items-start gap-2 rounded-lg border border-border bg-background px-3 py-3 text-sm transition-colors hover:border-accent hover:bg-secondary/60"
          >
            <a.icon className="size-4 text-accent" />
            {a.label}
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
