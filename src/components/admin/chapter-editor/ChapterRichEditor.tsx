import { useEffect, useRef, useState, useMemo } from "react";
import Code from "@tiptap/extension-code";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlertCircle,
  AlertTriangle,
  Bold,
  CheckCircle2,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  RotateCcw,
  Save,
  Superscript,
  Underline as UnderlineIcon,
} from "lucide-react";
import { notify } from "@/lib/notify";
import {
  looksLikePdfHtml,
  looksLikePdfWrappedText,
  normalizePastedPlainText,
  pastedTextToParagraphHtml,
} from "@/lib/normalize-pasted-text";
import { uploadMediaImage } from "@/lib/upload-media";
import type { AutosaveStatus } from "@/hooks/use-chapter-autosave";
import { DOMParser as ProseMirrorDOMParser } from "@tiptap/pm/model";
import { FootnoteRef, nextFootnoteMarker } from "@/components/editor/footnote-ref";

interface ChapterRichEditorProps {
  initialContent: any;
  onChange: (json: any) => void;
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  errorMessage: string | null;
  onSaveNow: () => void;
  onOpenConflictModal?: () => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function ChapterRichEditor({
  initialContent,
  onChange,
  status,
  lastSavedAt,
  errorMessage,
  onSaveNow,
  onOpenConflictModal,
  placeholder = "Commencez à rédiger votre chapitre ici…",
  readOnly = false,
}: ChapterRichEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [motsCount, setMotsCount] = useState(0);
  const [footnoteDraft, setFootnoteDraft] = useState<{
    marker: string;
    text: string;
  } | null>(null);

  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: "chapter-editor__code-block" } },
        blockquote: { HTMLAttributes: { class: "chapter-editor__quote" } },
      }),
      Underline,
      Code.configure({ HTMLAttributes: { class: "chapter-editor__inline-code" } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "chapter-editor__link", rel: "noopener noreferrer" },
      }),
      Image.configure({ HTMLAttributes: { class: "chapter-editor__image" } }),
      Placeholder.configure({ placeholder }),
      FootnoteRef,
    ],
    content: initialContent || { type: "doc", content: [] },
    editorProps: {
      attributes: {
        class: "chapter-editor__content min-h-[500px] p-6 focus:outline-none text-[1.1rem] leading-relaxed",
      },
      // Texte brut : rejoindre les wraps PDF en vrais paragraphes
      transformPastedText(text) {
        return normalizePastedPlainText(text);
      },
      // HTML (Acrobat, Edge, etc.) : souvent 1 <p> par ligne → on repasse par le texte brut
      handlePaste(view, event) {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        const plain = clipboard.getData("text/plain") || "";
        const html = clipboard.getData("text/html") || "";
        if (!plain.trim()) return false;

        if (!looksLikePdfWrappedText(plain) && !looksLikePdfHtml(html)) {
          return false;
        }

        event.preventDefault();
        const normalized = normalizePastedPlainText(plain);
        if (!normalized) return true;

        const wrapper = document.createElement("div");
        wrapper.innerHTML = pastedTextToParagraphHtml(normalized);
        const slice = ProseMirrorDOMParser.fromSchema(view.state.schema).parseSlice(wrapper);
        view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      const text = ed.getText();
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      setMotsCount(words);
      onChange(json);
    },
  });

  // Calcul du temps de lecture estimé (200 mots / min)
  const tempsLecture = useMemo(() => {
    const minutes = Math.max(1, Math.round(motsCount / 200));
    return `${minutes} min de lecture`;
  }, [motsCount]);

  // Synchronisation si le contenu change de l'extérieur (ex: restauration de snapshot)
  useEffect(() => {
    if (!editor || !initialContent) return;
    const currentJson = editor.getJSON();
    if (JSON.stringify(currentJson) !== JSON.stringify(initialContent)) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
      const text = editor.getText();
      setMotsCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  }, [editor, initialContent]);

  if (!editor) return null;

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

  const openFootnoteDialog = () => {
    setFootnoteDraft({
      number: nextFootnoteNumber(editor.state.doc),
      text: "",
    });
  };

  const confirmFootnote = () => {
    if (!footnoteDraft) return;
    const text = footnoteDraft.text.trim();
    if (!text) {
      notify.erreur("Saisissez le texte de la référence");
      return;
    }
    editor
      .chain()
      .focus()
      .insertFootnoteRef({
        number: footnoteDraft.number,
        text,
      })
      .run();
    setFootnoteDraft(null);
  };

  const insertImage = async (file: File) => {
    if (uploadingImage) return;
    setUploadingImage(true);
    try {
      const url = await uploadMediaImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      notify.succes("Image insérée dans le chapitre");
    } catch (error) {
      notify.erreur(error instanceof Error ? error.message : "Impossible d'insérer l'image");
    } finally {
      setUploadingImage(false);
    }
  };

  const btn = (active: boolean) =>
    `inline-flex items-center justify-center size-8 rounded text-sm transition-colors ${
      active
        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

  const formatHeure = (d: Date) =>
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
      {/* Barre d'état Autosave supérieure */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground">{motsCount} mots</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{tempsLecture}</span>
        </div>

        <div className="flex items-center gap-3">
          {status === "saving" && (
            <span className="inline-flex items-center gap-1.5 text-ochre font-medium">
              <Loader2 className="size-3.5 animate-spin" /> Enregistrement automatique…
            </span>
          )}

          {status === "saved" && lastSavedAt && (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Enregistré à {formatHeure(lastSavedAt)}
            </span>
          )}

          {status === "error" && (
            <div className="inline-flex items-center gap-2 text-destructive font-medium">
              <AlertCircle className="size-3.5" />
              <span>{errorMessage || "Erreur de sauvegarde"}</span>
              <button
                type="button"
                onClick={onSaveNow}
                className="underline hover:text-destructive/80 font-bold ml-1"
              >
                Réessayer
              </button>
            </div>
          )}

          {status === "conflict" && (
            <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-md font-medium">
              <AlertTriangle className="size-3.5" />
              <span>Conflit de révision</span>
              {onOpenConflictModal && (
                <button
                  type="button"
                  onClick={onOpenConflictModal}
                  className="underline hover:text-amber-700 font-bold ml-1"
                >
                  Résoudre
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onSaveNow}
            disabled={status === "saving"}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors"
            title="Sauvegarder immédiatement"
          >
            <Save className="size-3.5" /> Sauvegarder
          </button>
        </div>
      </div>

      {/* Barre d'outils d'édition */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-background/80 backdrop-blur">
        <button
          type="button"
          className={btn(editor.isActive("heading", { level: 1 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Titre 1"
        >
          <Heading1 className="size-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Titre 2"
        >
          <Heading2 className="size-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("heading", { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Titre 3"
        >
          <Heading3 className="size-4" />
        </button>

        <span className="h-5 w-px bg-border mx-1" aria-hidden />

        <button
          type="button"
          className={btn(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Gras"
        >
          <Bold className="size-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italique"
        >
          <Italic className="size-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("underline"))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Souligné"
        >
          <UnderlineIcon className="size-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("code"))}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Code inline"
        >
          <span className="font-mono text-xs">&lt;/&gt;</span>
        </button>

        <span className="h-5 w-px bg-border mx-1" aria-hidden />

        <button
          type="button"
          className={btn(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Liste à puces"
        >
          <List className="size-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Liste numérotée"
        >
          <ListOrdered className="size-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("blockquote"))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citation"
        >
          <Quote className="size-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("codeBlock"))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Bloc de code"
        >
          <Code2 className="size-4" />
        </button>
        <button
          type="button"
          className={btn(false)}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Séparateur"
        >
          <Minus className="size-4" />
        </button>

        <span className="h-5 w-px bg-border mx-1" aria-hidden />

        <button
          type="button"
          className={btn(editor.isActive("link"))}
          onClick={addLink}
          title="Ajouter un lien"
        >
          <Link2 className="size-4" />
        </button>
        <button
          type="button"
          className={btn(false)}
          onClick={openFootnoteDialog}
          title="Insérer une référence (note)"
        >
          <Superscript className="size-4" />
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

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className={btn(false)}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Annuler (Ctrl+Z)"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Zone de saisie principale */}
      <div className="flex-1 bg-background">
        <EditorContent editor={editor} />
      </div>

      {footnoteDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="footnote-dialog-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-lg">
            <h2 id="footnote-dialog-title" className="font-display text-lg font-semibold">
              Référence n°{footnoteDraft.number}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Placez le curseur après le mot, puis saisissez l’explication affichée au clic dans le
              lecteur.
            </p>
            <label className="mt-4 block text-xs font-medium text-muted-foreground" htmlFor="footnote-text">
              Texte de la référence
            </label>
            <textarea
              id="footnote-text"
              autoFocus
              rows={6}
              value={footnoteDraft.text}
              onChange={(e) => setFootnoteDraft({ ...footnoteDraft, text: e.target.value })}
              placeholder="Ex. : En Kikongo, le prénom Atumba…"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFootnoteDraft(null)}
                className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmFootnote}
                className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Insérer ⁿ{footnoteDraft.number}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
