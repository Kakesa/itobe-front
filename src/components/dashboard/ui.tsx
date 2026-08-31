import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  valeur,
  hint,
  icon: Icon,
  iconClassName,
  className,
}: {
  label: string;
  valeur: string | number;
  hint?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card p-4 shadow-soft transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg",
              iconClassName ?? "bg-secondary text-muted-foreground",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl tracking-tight md:text-3xl">{valeur}</p>
      {hint && <p className="mt-1 text-xs text-accent">{hint}</p>}
    </div>
  );
}

export function SectionCard({
  titre,
  action,
  children,
  className,
}: {
  titre: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/80 bg-card p-5 shadow-soft",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg">{titre}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-muted", className)} />
  );
}

export function EmptyState({ titre, detail }: { titre: string; detail: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <p className="font-display text-lg">{titre}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
