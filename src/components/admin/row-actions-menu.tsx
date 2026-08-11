import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type RowAction = {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  separatorBefore?: boolean;
  hidden?: boolean;
};

/** Menu « … » pour les actions de ligne CRUD. */
export function RowActionsMenu({
  actions,
  align = "end",
}: {
  actions: RowAction[];
  align?: "start" | "end" | "center";
}) {
  const visibles = actions.filter((a) => !a.hidden);
  if (visibles.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Actions"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-42">
        {visibles.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={`${a.label}-${i}`}>
              {a.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className={
                  a.destructive
                    ? "cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    : "cursor-pointer"
                }
                onSelect={() => {
                  a.onClick();
                }}
              >
                {Icon && <Icon className="size-4" />}
                {a.label}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
