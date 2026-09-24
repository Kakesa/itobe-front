import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
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

export function Typewriter({
  text,
  className = "",
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  as?: "h1" | "p";
}) {
  const [shown, setShown] = useState("");
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduce) {
      setShown(text);
      return;
    }

    let i = 0;
    let deleting = false;
    let timer: number | undefined;
    const typeMs = 78;
    const deleteMs = 28;
    const deleteStep = 1;
    const holdFullMs = 3200;
    const holdEmptyMs = 700;

    const tick = () => {
      if (!deleting) {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          deleting = true;
          timer = window.setTimeout(tick, holdFullMs);
          return;
        }
        timer = window.setTimeout(tick, typeMs);
        return;
      }

      i = Math.max(i - deleteStep, 0);
      setShown(text.slice(0, i));
      if (i <= 0) {
        deleting = false;
        timer = window.setTimeout(tick, holdEmptyMs);
        return;
      }
      timer = window.setTimeout(tick, deleteMs);
    };

    setShown("");
    timer = window.setTimeout(tick, 420);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [text, reduce]);

  return (
    <Tag className={className}>
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      <span aria-hidden="true">
        {shown.split("\n").map((line, i, arr) => (
          <span key={i} className="block md:whitespace-nowrap">
            {line}
            {i === arr.length - 1 && !reduce ? <span className="prod-type-caret" /> : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
