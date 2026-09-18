import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const liens = [
  { to: "/entreprise/about", label: "About" },
  { to: "/entreprise/founders", label: "Founders" },
  { to: "/entreprise/contact", label: "Contact" },
] as const;

export function GroupeNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="absolute right-4 top-5 z-20 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 md:right-8 md:top-7 md:gap-x-6"
      aria-label="Menu"
    >
      {liens.map((lien) => (
        <Link
          key={lien.to}
          to={lien.to}
          className={cn(
            "text-[0.78rem] font-semibold uppercase tracking-brand text-muted-foreground transition-colors hover:text-foreground",
            pathname === lien.to && "text-foreground",
          )}
        >
          {lien.label}
        </Link>
      ))}
    </nav>
  );
}

export function GroupeShell({
  children,
  centered = false,
}: {
  children: ReactNode;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-svh flex-col overflow-hidden bg-background",
        centered
          ? "items-center justify-center px-4 py-14"
          : "px-4 pb-20 pt-24 md:pt-28",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 paper-grain opacity-60"
      />
      <GroupeNav />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
