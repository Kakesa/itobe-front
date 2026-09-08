import React, { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

interface TiptapMark {
  type: string;
  attrs?: Record<string, any>;
}

interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
}

interface ChapterJsonBodyProps {
  content: TiptapNode | Record<string, any> | null | undefined;
  className?: string;
  taillePolice?: number;
  /** Mode livre ouvert : pas de classes Tailwind qui cassent le CSS typographique */
  variant?: "default" | "book";
}

function FootnoteMarker({
  number,
  text,
  book,
}: {
  number: number;
  text: string;
  book: boolean;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="footnote-ref"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`Voir la référence ${number}`}
        title={text ? `Référence ${number}` : undefined}
      >
        {number}
      </button>
      {open && (
        <div
          className="footnote-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <aside
            className={`footnote-panel ${book ? "footnote-panel--book" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="footnote-panel__header">
              <h2 id={titleId}>Référence {number}</h2>
              <button
                type="button"
                className="footnote-panel__close"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="footnote-panel__body">
              {text.trim() ? text : "Aucune description pour cette référence."}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function renderTextWithMarks(text: string, marks?: TiptapMark[]): React.ReactNode {
  if (!marks || marks.length === 0) {
    return text;
  }

  let element: React.ReactNode = text;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        element = <strong>{element}</strong>;
        break;
      case "italic":
        element = <em>{element}</em>;
        break;
      case "underline":
        element = <u>{element}</u>;
        break;
      case "code":
        element = <code>{element}</code>;
        break;
      case "link":
        element = (
          <a
            href={mark.attrs?.href || "#"}
            target={mark.attrs?.target || "_blank"}
            rel="noopener noreferrer"
          >
            {element}
          </a>
        );
        break;
    }
  }

  return element;
}

function renderNode(
  node: TiptapNode,
  index: number,
  variant: "default" | "book",
): React.ReactNode {
  if (!node) return null;

  if (node.type === "text") {
    return (
      <React.Fragment key={index}>
        {renderTextWithMarks(node.text || "", node.marks)}
      </React.Fragment>
    );
  }

  if (node.type === "hardBreak") {
    return <br key={index} />;
  }

  if (node.type === "footnoteRef") {
    return (
      <FootnoteMarker
        key={node.attrs?.id || index}
        number={Number(node.attrs?.number) || 1}
        text={String(node.attrs?.text || "")}
        book={variant === "book"}
      />
    );
  }

  const children = node.content?.map((child, i) => renderNode(child, i, variant));
  const book = variant === "book";

  switch (node.type) {
    case "doc":
      return <div key={index}>{children}</div>;

    case "paragraph":
      return (
        <p key={index} className={book ? undefined : "my-4 leading-relaxed"}>
          {children && children.length > 0 ? children : <br />}
        </p>
      );

    case "heading": {
      const level = node.attrs?.level || 1;
      if (book) {
        if (level === 1) return <h1 key={index}>{children}</h1>;
        if (level === 2) return <h2 key={index}>{children}</h2>;
        return <h3 key={index}>{children}</h3>;
      }
      if (level === 1) {
        return (
          <h1
            key={index}
            className="mt-8 mb-4 font-display text-2xl sm:text-3xl font-bold text-foreground"
          >
            {children}
          </h1>
        );
      }
      if (level === 2) {
        return (
          <h2
            key={index}
            className="mt-6 mb-3 font-display text-xl sm:text-2xl font-bold text-foreground"
          >
            {children}
          </h2>
        );
      }
      return (
        <h3
          key={index}
          className="mt-5 mb-2 font-display text-lg sm:text-xl font-semibold text-foreground"
        >
          {children}
        </h3>
      );
    }

    case "bulletList":
      return (
        <ul key={index} className={book ? undefined : "my-4 list-disc pl-6 space-y-1.5"}>
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index} className={book ? undefined : "my-4 list-decimal pl-6 space-y-1.5"}>
          {children}
        </ol>
      );

    case "listItem":
      return <li key={index}>{children}</li>;

    case "blockquote":
      return (
        <blockquote
          key={index}
          className={
            book
              ? undefined
              : "my-5 border-l-4 border-accent pl-4 italic text-foreground/90 bg-muted/20 py-2 rounded-r"
          }
        >
          {children}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre
          key={index}
          className={
            book ? undefined : "my-5 overflow-x-auto rounded-xl bg-secondary/80 p-4 font-mono text-sm"
          }
        >
          <code>{children}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={index} className={book ? undefined : "my-8 border-border"} />;

    case "image":
      return (
        <figure key={index} className={book ? undefined : "my-6"}>
          <img
            src={node.attrs?.src}
            alt={node.attrs?.alt || ""}
            title={node.attrs?.title}
            className={
              book
                ? undefined
                : "rounded-xl border border-border max-w-full h-auto mx-auto shadow-sm"
            }
          />
          {node.attrs?.alt && <figcaption>{node.attrs.alt}</figcaption>}
        </figure>
      );

    default:
      return <div key={index}>{children}</div>;
  }
}

export function ChapterJsonBody({
  content,
  className = "",
  taillePolice = 18,
  variant = "default",
}: ChapterJsonBodyProps) {
  if (!content) return null;

  const doc = content.type === "doc" ? (content as TiptapNode) : { type: "doc", content: [] };

  return (
    <div
      className={`chapter-reader-body select-text ${className}`}
      style={{ fontSize: `${taillePolice}px` }}
      data-variant={variant}
    >
      {renderNode(doc, 0, variant)}
    </div>
  );
}
