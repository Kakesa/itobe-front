import { useEffect, useRef, useState } from "react";
import Code from "@tiptap/extension-code";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
} from "lucide-react";
import { notify } from "@/lib/notify";
import { uploadMediaImage } from "@/lib/upload-media";

type ArticleRichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type BlockStyle = "paragraph" | "h1" | "h2" | "h3";

export function plainTextToHtml(text: string): string {
  const raw = text.trim();
  if (!raw || raw.startsWith("<")) return text;
  return raw
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function richTextIsEmpty(html: string): boolean {
  return !stripHtml(html);
}

function blockStyleFromEditor(editor: NonNullable<ReturnType<typeof useEditor>>): BlockStyle {
  if (editor.isActive("heading", { level: 1 })) return "h1";
  if (editor.isActive("heading", { level: 2 })) return "h2";
  if (editor.isActive("heading", { level: 3 })) return "h3";
  return "paragraph";
}

export function ArticleRichEditor({
  value,
  onChange,
  placeholder = "Rédigez le corps de l'article…",
}: ArticleRichEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: "rich-editor__code-block" } },
        blockquote: { HTMLAttributes: { class: "rich-editor__quote" } },
      }),
      Underline,
      Code.configure({ HTMLAttributes: { class: "rich-editor__inline-code" } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "rich-editor__link", rel: "noopener noreferrer" },
      }),
      Image.configure({ HTMLAttributes: { class: "rich-editor__image" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "rich-editor__content",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current && next !== (current === "<p></p>" ? "" : current)) {
      editor.commands.setContent(next || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const setBlockStyle = (style: BlockStyle) => {
    if (style === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = Number(style.replace("h", "")) as 1 | 2 | 3;
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const addLink = () => {
    const previous = editor.getAttributes("link")["href"] as string | undefined;
    const url = window.prompt("URL du lien", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = async (file: File) => {
    if (uploadingImage) return;
    setUploadingImage(true);
    try {
      const url = await uploadMediaImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      notify.succes("Image insérée dans le contenu");
    } catch (error) {
      notify.erreur(
        error instanceof Error ? error.message : "Impossible d'insérer l'image",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const btn = (active: boolean) =>
    `rich-editor__btn${active ? " rich-editor__btn--active" : ""}`;

  return (
    <div className="rich-editor">
      <div className="rich-editor__toolbar">
        <select
          className="rich-editor__style"
          value={blockStyleFromEditor(editor)}
          onChange={(e) => setBlockStyle(e.target.value as BlockStyle)}
          aria-label="Style de paragraphe"
        >
          <option value="paragraph">Style</option>
          <option value="h1">Titre 1</option>
          <option value="h2">Titre 2</option>
          <option value="h3">Titre 3</option>
        </select>

        <span className="rich-editor__sep" aria-hidden />

        <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras">
          <Bold className="size-4" />
        </button>
        <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique">
          <Italic className="size-4" />
        </button>
        <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste à puces">
          <List className="size-4" />
        </button>
        <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée">
          <ListOrdered className="size-4" />
        </button>
        <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation">
          <Quote className="size-4" />
        </button>
        <button type="button" className={btn(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Bloc de code">
          <Code2 className="size-4" />
        </button>
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur">
          <Minus className="size-4" />
        </button>
        <button type="button" className={btn(editor.isActive("link"))} onClick={addLink} title="Lien">
          <Link2 className="size-4" />
        </button>
        <button type="button" className={btn(editor.isActive("code"))} onClick={() => editor.chain().focus().toggleCode().run()} title="Code inline">
          <span className="font-mono text-xs">&lt;/&gt;</span>
        </button>
        <button
          type="button"
          className={btn(false)}
          onClick={() => imageInputRef.current?.click()}
          title="Insérer une image"
        >
          {uploadingImage ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void insertImage(file);
            e.target.value = "";
          }}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

/** Affiche le HTML d'un article sur le site public. */
export function ArticleHtmlBody({ html, fallbackParagraphs }: { html?: string; fallbackParagraphs: string[] }) {
  const trimmed = html?.trim() ?? "";
  const looksLikeHtml = trimmed.startsWith("<") && trimmed.includes(">");

  if (looksLikeHtml) {
    return (
      <div
        className="article-body rich-editor__preview space-y-4 text-[1.05rem] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  return (
    <div className="space-y-6 text-[1.05rem] leading-relaxed">
      {fallbackParagraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
