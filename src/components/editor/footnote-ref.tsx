import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import type { ReactNodeViewProps } from "@tiptap/react";

export type FootnoteRefAttrs = {
  id: string;
  /** Marqueur affiché en exposant : chiffre, lettre ou caractère spécial (*, †, ²…). */
  marker: string;
  /** @deprecated Conservé pour les anciennes notes (number → marker). */
  number?: number | null;
  text: string;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    footnoteRef: {
      insertFootnoteRef: (attrs: Partial<FootnoteRefAttrs>) => ReturnType;
    };
  }
}

function createFootnoteId() {
  return `fn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function resolveFootnoteMarker(attrs: {
  marker?: unknown;
  number?: unknown;
}): string {
  const marker = attrs.marker != null ? String(attrs.marker).trim() : "";
  if (marker) return marker;
  if (attrs.number != null && String(attrs.number).trim() !== "") {
    return String(attrs.number);
  }
  return "1";
}

/** Prochain marqueur numérique suggéré (ignore *, †, etc.). */
export function nextFootnoteMarker(doc: {
  descendants: (
    f: (node: { type: { name: string }; attrs: Record<string, unknown> }) => void,
  ) => void;
}): string {
  let max = 0;
  doc.descendants((node) => {
    if (node.type.name !== "footnoteRef") return;
    const raw = resolveFootnoteMarker(node.attrs);
    if (/^\d+$/.test(raw)) {
      const n = Number(raw);
      if (n > max) max = n;
    }
  });
  return String(max + 1);
}

/** @deprecated Utiliser nextFootnoteMarker */
export function nextFootnoteNumber(doc: Parameters<typeof nextFootnoteMarker>[0]): number {
  return Number(nextFootnoteMarker(doc)) || 1;
}

function FootnoteRefNodeView({ node }: ReactNodeViewProps) {
  const marker = resolveFootnoteMarker(node.attrs);
  const text = String(node.attrs.text || "");
  return (
    <NodeViewWrapper
      as="sup"
      className="footnote-ref"
      data-footnote-ref=""
      title={text || `Référence ${marker}`}
    >
      {marker}
    </NodeViewWrapper>
  );
}

/**
 * Note de référence inline (exposant cliquable).
 * Le marqueur peut être un chiffre ou un caractère spécial.
 */
export const FootnoteRef = Node.create({
  name: "footnoteRef",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-footnote-id"),
        renderHTML: (attrs) => (attrs.id ? { "data-footnote-id": attrs.id } : {}),
      },
      marker: {
        default: "1",
        parseHTML: (el) =>
          el.getAttribute("data-footnote-marker") ||
          el.getAttribute("data-footnote-number") ||
          (el.textContent || "").trim() ||
          "1",
        renderHTML: (attrs) => ({
          "data-footnote-marker": resolveFootnoteMarker(attrs),
        }),
      },
      number: {
        default: null,
        parseHTML: (el) => {
          const raw = el.getAttribute("data-footnote-number");
          return raw != null ? Number(raw) : null;
        },
        renderHTML: () => ({}),
      },
      text: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-footnote-text") || el.getAttribute("title") || "",
        renderHTML: (attrs) => ({
          "data-footnote-text": attrs.text || "",
          title: attrs.text || "",
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "sup[data-footnote-ref]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "sup",
      mergeAttributes(HTMLAttributes, {
        "data-footnote-ref": "",
        class: "footnote-ref",
      }),
      resolveFootnoteMarker(node.attrs),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteRefNodeView);
  },

  addCommands() {
    return {
      insertFootnoteRef:
        (attrs = {}) =>
        ({ commands }) => {
          const marker = resolveFootnoteMarker({
            marker: attrs.marker,
            number: attrs.number,
          });
          return commands.insertContent({
            type: this.name,
            attrs: {
              id: attrs.id || createFootnoteId(),
              marker,
              number: null,
              text: attrs.text ?? "",
            },
          });
        },
    };
  },
});
