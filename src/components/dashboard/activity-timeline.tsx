import {
  BookOpen,
  CreditCard,
  FileText,
  MessageSquare,
  Newspaper,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import type { ActiviteItem } from "@/lib/dashboard/types";
import { SectionCard } from "./ui";

const icons = {
  utilisateur: UserPlus,
  article: Newspaper,
  livre: BookOpen,
  commande: ShoppingBag,
  paiement: CreditCard,
  commentaire: MessageSquare,
  newsletter: FileText,
};

export function ActivityTimeline({ items }: { items: ActiviteItem[] }) {
  return (
    <SectionCard titre="Activité récente">
      <ol className="space-y-4">
        {items.map((a) => {
          const Icon = icons[a.type];
          return (
            <li key={a.id} className="flex gap-3">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-foreground">
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{a.titre}</p>
                <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
              </div>
              <span className="shrink-0 text-[0.65rem] text-muted-foreground">{a.date}</span>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}
