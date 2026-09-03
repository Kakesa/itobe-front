import React from "react";

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
}

function renderTextWithMarks(text: string, marks?: TiptapMark[]): React.ReactNode {
  if (!marks || marks.length === 0) {
    return text;
  }

  let element: React.ReactNode = text;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        element = <strong className="font-bold">{element}</strong>;
        break;
      case "italic":
        element = <em className="italic">{element}</em>;
        break;
      case "underline":
        element = <u className="underline">{element}</u>;
        break;
      case "code":
        element = (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
            {element}
          </code>
        );
        break;
      case "link":
        element = (
          <a
            href={mark.attrs?.href || "#"}
            target={mark.attrs?.target || "_blank"}
            rel="noopener noreferrer"
            className="text-accent underline hover:opacity-80 transition"
          >
            {element}
          </a>
        );
        break;
    }
  }

  return element;
}

function renderNode(node: TiptapNode, index: number): React.ReactNode {
  if (!node) return null;

  if (node.type === "text") {
    return (
      <React.Fragment key={index}>
        {renderTextWithMarks(node.text || "", node.marks)}
      </React.Fragment>
    );
  }

  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <div key={index}>{children}</div>;

    case "paragraph":
      return (
        <p key={index} className="my-4 leading-relaxed">
          {children && children.length > 0 ? children : <br />}
        </p>
      );

    case "heading": {
      const level = node.attrs?.level || 1;
      if (level === 1) {
        return (
          <h1 key={index} className="mt-8 mb-4 font-display text-2xl sm:text-3xl font-bold text-foreground">
            {children}
          </h1>
        );
      }
      if (level === 2) {
        return (
          <h2 key={index} className="mt-6 mb-3 font-display text-xl sm:text-2xl font-bold text-foreground">
            {children}
          </h2>
        );
      }
      return (
        <h3 key={index} className="mt-5 mb-2 font-display text-lg sm:text-xl font-semibold text-foreground">
          {children}
        </h3>
      );
    }

    case "bulletList":
      return (
        <ul key={index} className="my-4 list-disc pl-6 space-y-1.5">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index} className="my-4 list-decimal pl-6 space-y-1.5">
          {children}
        </ol>
      );

    case "listItem":
      return <li key={index}>{children}</li>;

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="my-5 border-l-4 border-accent pl-4 italic text-foreground/90 bg-muted/20 py-2 rounded-r"
        >
          {children}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre
          key={index}
          className="my-5 overflow-x-auto rounded-xl bg-secondary/80 p-4 font-mono text-sm leading-normal text-foreground"
        >
          <code>{children}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={index} className="my-8 border-border" />;

    case "image":
      return (
        <figure key={index} className="my-6">
          <img
            src={node.attrs?.src}
            alt={node.attrs?.alt || ""}
            title={node.attrs?.title}
            className="rounded-xl border border-border max-w-full h-auto mx-auto shadow-sm"
          />
          {node.attrs?.alt && (
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              {node.attrs.alt}
            </figcaption>
          )}
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
}: ChapterJsonBodyProps) {
  if (!content) return null;

  const doc = content.type === "doc" ? (content as TiptapNode) : { type: "doc", content: [] };

  return (
    <div
      className={`chapter-reader-body select-text ${className}`}
      style={{ fontSize: `${taillePolice}px` }}
    >
      {renderNode(doc, 0)}
    </div>
  );
}
