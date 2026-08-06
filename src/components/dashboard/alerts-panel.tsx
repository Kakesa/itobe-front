import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { AlerteItem } from "@/lib/dashboard/types";
import { SectionCard } from "./ui";

export function AlertsPanel({ items }: { items: AlerteItem[] }) {
  return (
    <SectionCard titre="Alertes">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune alerte pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => {
            const Icon =
              a.niveau === "critique"
                ? OctagonAlert
                : a.niveau === "attention"
                  ? AlertTriangle
                  : Info;
            const ton =
              a.niveau === "critique"
                ? "text-destructive"
                : a.niveau === "attention"
                  ? "text-ochre"
                  : "text-muted-foreground";
            return (
              <li key={a.id} className="flex items-start gap-2 text-sm">
                <Icon className={`mt-0.5 size-4 shrink-0 ${ton}`} />
                <span className="flex-1">
                  {a.message}
                  {a.lien && (
                    <Link
                      to={a.lien as "/admin"}
                      className="ml-2 text-xs text-accent hover:underline"
                    >
                      Voir
                    </Link>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
