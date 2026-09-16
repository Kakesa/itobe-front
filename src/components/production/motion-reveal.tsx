import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("prod-reveal", className)}
      style={{ animationDelay: `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function MaskedLine({
  children,
  delay,
  italic = false,
}: {
  children: ReactNode;
  delay: number;
  italic?: boolean;
}) {
  const Tag = italic ? "em" : "span";
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <span className="prod-line block" style={{ animationDelay: `${delay}s` }}>
        <Tag>{children}</Tag>
      </span>
    </span>
  );
}
