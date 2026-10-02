import React, { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { resolveFootnoteMarker } from "@/components/editor/footnote-ref";

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
  content: TiptapNode | Record<string, any> | string | null | undefined;
  className?: string;
  taillePolice?: number;
  /** Mode livre ouvert : pas de classes Tailwind qui cassent le CSS typographique */
  variant?: "default" | "book";
  /**
   * Registre partagé des titres déjà vus (ex. double page).
   * Les occurrences suivantes d’un même titre sont affichées en gris.
   */
  seenTitles?: Set<string>;
}

type FootnoteItem = { id: string; marker: string; text: string };

function collectFootnotes(node: TiptapNode | null | undefined, out: FootnoteItem[] = []): FootnoteItem[] {
  if (!node) return out;
  if (node.type === "footnoteRef") {
    out.push({
      id: String(node.attrs?.id || `fn-${out.length + 1}`),
      marker: resolveFootnoteMarker(node.attrs || {}),
      text: String(node.attrs?.text || ""),
    });
  }
  node.content?.forEach((child) => collectFootnotes(child, out));
  return out;
}

function normalizeDoc(content: ChapterJsonBodyProps["content"]): TiptapNode | null {
  if (!content) return null;
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content) as TiptapNode;
      return normalizeDoc(parsed);
    } catch {
      return {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: content }] }],
      };
    }
  }
  if (content.type === "doc") return content as TiptapNode;
  if (Array.isArray((content as TiptapNode).content)) {
    return { type: "doc", content: (content as TiptapNode).content };
  }
  return { type: "doc", content: [] };
}

function FootnoteMarker({
  marker,
  text,
  book,
  noteId,
}: {
  marker: string;
  text: string;
  book: boolean;
  noteId: string;
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

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
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
                <h2 id={titleId}>Référence {marker}</h2>
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
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="footnote-ref"
        id={`footnote-call-${noteId}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`Voir la référence ${marker}`}
        title={text ? `Référence ${marker}` : undefined}
      >
        {marker}
      </button>
      {panel}
    </>
  );
}

function extractPlainText(node: TiptapNode | null | undefined): string {
  if (!node) return "";
  if (node.text) return node.text;
  return (node.content || []).map(extractPlainText).join("");
}

function normalizeTitleKey(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().toLowerCase();
}

/** @returns true si le titre a déjà été vu (→ afficher en gris). */
export function claimRepeatedTitle(seenTitles: Set<string>, raw: string): boolean {
  const key = normalizeTitleKey(raw);
  if (!key) return false;
  if (seenTitles.has(key)) return true;
  seenTitles.add(key);
  return false;
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

/** Nom technique d'import (file_0000…, photo.jpg) : ne pas l'afficher dans la page. */
function estNomFichier(valeur: string) {
  const brut = valeur.trim();
  if (!brut) return true;
  const base = (brut.split(/[/\\]/).pop() ?? brut).replace(/\.[a-z0-9]{2,5}$/i, "");
  if (/^file[\s_-]/i.test(base)) return true;
  if (/[0-9a-f]{16,}/i.test(base.replace(/[\s_-]/g, ""))) return true;
  if (!brut.includes(" ") && /[._-]/.test(brut)) return true;
  return /\.[a-z0-9]{2,5}$/i.test(brut.trim());
}

function renderNode(
  node: TiptapNode,
  index: number,
  variant: "default" | "book",
  seenTitles: Set<string>,
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
    const marker = resolveFootnoteMarker(node.attrs || {});
    const id = String(node.attrs?.id || `fn-${index}`);
    return (
      <FootnoteMarker
        key={id}
        noteId={id}
        marker={marker}
        text={String(node.attrs?.text || "")}
        book={variant === "book"}
      />
    );
  }

  const children = node.content?.map((child, i) =>
    renderNode(child, i, variant, seenTitles),
  );
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
      const repeated = claimRepeatedTitle(seenTitles, extractPlainText(node));
      const repeatClass = repeated ? "reader-heading--repeat" : undefined;
      if (book) {
        if (level === 1) return <h1 key={index} className={repeatClass}>{children}</h1>;
        if (level === 2) return <h2 key={index} className={repeatClass}>{children}</h2>;
        return <h3 key={index} className={repeatClass}>{children}</h3>;
      }
      const base =
        level === 1
          ? "mt-8 mb-4 font-display text-2xl sm:text-3xl font-bold"
          : level === 2
            ? "mt-6 mb-3 font-display text-xl sm:text-2xl font-bold"
            : "mt-5 mb-2 font-display text-lg sm:text-xl font-semibold";
      const color = repeated ? "text-muted-foreground" : "text-foreground";
      const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      return (
        <Tag key={index} className={`${base} ${color} ${repeatClass ?? ""}`.trim()}>
          {children}
        </Tag>
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

    case "image": {
      const align = node.attrs?.align;
      const decor = node.attrs?.taille === "decor";
      const altBrut = String(node.attrs?.alt || "");
      const alt = estNomFichier(altBrut) ? "" : altBrut;
      return (
        <figure
          key={index}
          data-align={align === "gauche" || align === "centre" || align === "droite" ? align : undefined}
          data-taille={decor ? "decor" : undefined}
          className={book ? undefined : "my-6"}
        >
          <img
            src={node.attrs?.src}
            alt={alt}
            className={
              book
                ? undefined
                : "rounded-xl border border-border max-w-full h-auto mx-auto shadow-sm"
            }
          />
        </figure>
      );
    }

    default:
      return <div key={index}>{children}</div>;
  }
}

export function ChapterJsonBody({
  content,
  className = "",
  taillePolice = 18,
  variant = "default",
  seenTitles,
}: ChapterJsonBodyProps) {
  const doc = useMemo(() => normalizeDoc(content), [content]);
  const footnotes = useMemo(() => (doc ? collectFootnotes(doc) : []), [doc]);
  const titlesRegistry = seenTitles ?? new Set<string>();

  if (!doc) return null;

  return (
    <div
      className={`chapter-reader-body select-text ${className}`}
      style={{ fontSize: `${taillePolice}px` }}
      data-variant={variant}
    >
      {renderNode(doc, 0, variant, titlesRegistry)}

      {footnotes.length > 0 && (
        <section className="footnote-list" aria-label="Notes et références">
          <h2 className="footnote-list__title">Notes</h2>
          <ol className="footnote-list__items">
            {footnotes.map((fn) => (
              <li key={fn.id} id={`footnote-note-${fn.id}`}>
                <span className="footnote-list__marker">{fn.marker}</span>
                <span className="footnote-list__text">
                  {fn.text.trim() || "—"}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
