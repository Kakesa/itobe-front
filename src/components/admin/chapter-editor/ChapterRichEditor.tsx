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
import { emplacementImage, tailleImage, type EmplacementImage, type TailleImage } from "@/components/admin/image-editor/cadre-page";
import { ImageEditor } from "@/components/admin/image-editor/ImageEditor";
import type { AutosaveStatus } from "@/hooks/use-chapter-autosave";
import { DOMParser as ProseMirrorDOMParser, Fragment, Slice } from "@tiptap/pm/model";
import { FootnoteRef, nextFootnoteMarker } from "@/components/editor/footnote-ref";

const ImageAvecEmplacement = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "pleine",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-align") || "pleine",
        renderHTML: (attributes: { align?: string }) => ({
          "data-align": attributes.align || "pleine",
        }),
      },
      taille: {
        default: "page",
        parseHTML: (element: HTMLElement) => (element.getAttribute("data-taille") === "decor" ? "decor" : "page"),
        renderHTML: (attributes: { taille?: string }) => ({
          "data-taille": attributes.taille === "decor" ? "decor" : "page",
        }),
      },
    };
  },
});

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
  /** Ouvre l'éditeur d'image avant l'upload (pages de livre uniquement). */
  editeurImagePage?: boolean;
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
  editeurImagePage = false,
}: ChapterRichEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sessionImage, setSessionImage] = useState<{
    src: string;
    fichier: File | null;
    mode: "inserer" | "remplacer";
    pos?: number;
    emplacement: EmplacementImage;
    taille: TailleImage;
  } | null>(null);
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
      ImageAvecEmplacement.configure({ HTMLAttributes: { class: "chapter-editor__image" } }),
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

  /** Citation sur la sélection (ou nouveau bloc au curseur), pas tout le paragraphe. */
  const appliquerCitation = () => {
    if (editor.isActive("blockquote")) {
      editor.chain().focus().toggleBlockquote().run();
      return;
    }

    const { state } = editor;
    const { from, to, empty } = state.selection;
    const blockquoteType = state.schema.nodes["blockquote"];
    const paragraphType = state.schema.nodes["paragraph"];
    if (!blockquoteType || !paragraphType) return;

    if (!empty) {
      editor
        .chain()
        .focus()
        .command(({ tr, dispatch, state: s }) => {
          if (!dispatch) return true;
          const slice = s.doc.slice(from, to);
          let inner = slice.content;
          const first = inner.firstChild;
          const isInlineOnly = !first || !first.isBlock;
          if (isInlineOnly || slice.openStart > 0) {
            inner = Fragment.from(paragraphType.create(null, slice.content));
          }
          const blockquote = blockquoteType.create(null, inner);
          tr.replaceRange(from, to, new Slice(Fragment.from(blockquote), 0, 0));
          dispatch(tr.scrollIntoView());
          return true;
        })
        .run();
      return;
    }

    // Curseur seul : insère une citation vide à l’endroit du pointeur
    editor
      .chain()
      .focus()
      .insertContent({
        type: "blockquote",
        content: [{ type: "paragraph" }],
      })
      .run();
  };

  const openFootnoteDialog = () => {
    setFootnoteDraft({
      marker: nextFootnoteMarker(editor.state.doc),
      text: "",
    });
  };

  const confirmFootnote = () => {
    if (!footnoteDraft) return;
    const marker = footnoteDraft.marker.trim();
    const text = footnoteDraft.text.trim();
    if (!marker) {
      notify.erreur("Indiquez un marqueur (chiffre ou caractère spécial)");
      return;
    }
    if (!text) {
      notify.erreur("Saisissez le texte de la référence");
      return;
    }
    editor
      .chain()
      .focus()
      .insertFootnoteRef({
        marker,
        text,
      })
      .run();
    setFootnoteDraft(null);
  };

  const fermerSessionImage = () => {
    setSessionImage((session) => {
      if (session?.fichier) URL.revokeObjectURL(session.src);
      return null;
    });
  };

  const appliquerPresentation = (emplacement: EmplacementImage, taille: TailleImage, pos?: number) => {
    if (!editor) return;
    const chaine = editor.chain().focus();
    if (typeof pos === "number") chaine.setNodeSelection(pos);
    chaine.updateAttributes("image", { align: emplacement, taille }).run();
    notify.succes("Présentation de l'image mise à jour");
    fermerSessionImage();
  };

  const envoyerImage = async (
    fichier: File,
    mode: "inserer" | "remplacer",
    pos?: number,
    emplacement: EmplacementImage = "pleine",
    taille: TailleImage = "page",
  ) => {
    if (!editor || uploadingImage) return;
    setUploadingImage(true);
    try {
      const url = await uploadMediaImage(fichier);
      if (mode === "remplacer") {
        const chaine = editor.chain().focus();
        if (typeof pos === "number") chaine.setNodeSelection(pos);
        chaine.updateAttributes("image", { src: url, alt: fichier.name, align: emplacement, taille }).run();
        notify.succes("Image de la page mise à jour");
      } else {
        editor.chain().focus().setImage({ src: url, alt: fichier.name, align: emplacement, taille }).run();
        notify.succes(editeurImagePage ? "Image insérée dans la page" : "Image insérée dans le chapitre");
      }
      fermerSessionImage();
    } catch (error) {
      notify.erreur(error instanceof Error ? error.message : "Impossible d'enregistrer l'image");
    } finally {
      setUploadingImage(false);
    }
  };

  const insertImage = async (file: File) => {
    if (uploadingImage) return;
    if (editeurImagePage) {
      setSessionImage({
        src: URL.createObjectURL(file),
        fichier: file,
        mode: "inserer",
        emplacement: "pleine",
        taille: "page",
      });
      return;
    }
    await envoyerImage(file, "inserer");
  };

  const ouvrirAjustement = () => {
    if (!editor) return;
    const src = String(editor.getAttributes("image").src ?? "");
    if (!src) return;
    setSessionImage({
      src,
      fichier: null,
      mode: "remplacer",
      pos: editor.state.selection.from,
      emplacement: emplacementImage(editor.getAttributes("image").align),
      taille: tailleImage(editor.getAttributes("image").taille),
    });
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
          onClick={appliquerCitation}
          title="Citation (sélection ou curseur)"
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
          title={editeurImagePage ? "Ajouter une image à la page" : "Insérer une image"}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
        </button>
        {editeurImagePage && editor.isActive("image") ? (
          <button
            type="button"
            className={btn(true)}
            onClick={ouvrirAjustement}
            title="Ajuster l'image de la page"
          >
            <span className="px-1 text-[0.65rem] font-semibold">Ajuster</span>
          </button>
        ) : null}
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
        {sessionImage ? (
          <ImageEditor
            ouvert
            source={sessionImage.src}
            nom={sessionImage.fichier?.name || "page"}
            emplacementInitial={sessionImage.emplacement}
            tailleInitiale={sessionImage.taille}
            onAnnuler={fermerSessionImage}
            onValider={(resultat) => {
              const presentationChangee =
                resultat.emplacement !== sessionImage.emplacement || resultat.taille !== sessionImage.taille;
              if (resultat.inchange) {
                if (sessionImage.fichier) {
                  void envoyerImage(
                    sessionImage.fichier,
                    sessionImage.mode,
                    sessionImage.pos,
                    resultat.emplacement,
                    resultat.taille,
                  );
                } else if (presentationChangee) {
                  appliquerPresentation(resultat.emplacement, resultat.taille, sessionImage.pos);
                } else {
                  fermerSessionImage();
                }
                return;
              }
              void envoyerImage(
                resultat.fichier,
                sessionImage.mode,
                sessionImage.pos,
                resultat.emplacement,
                resultat.taille,
              );
            }}
          />
        ) : null}

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
              Nouvelle référence
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Placez le curseur après le mot. Le marqueur peut être un chiffre (1, 2) ou un
              caractère spécial (*, †, ‡, ²…).
            </p>

            <label className="mt-4 block text-xs font-medium text-muted-foreground" htmlFor="footnote-marker">
              Marqueur
            </label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <input
                id="footnote-marker"
                value={footnoteDraft.marker}
                onChange={(e) => setFootnoteDraft({ ...footnoteDraft, marker: e.target.value })}
                maxLength={8}
                className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm outline-none focus:border-accent"
                aria-label="Marqueur de la référence"
              />
              {["1", "2", "3", "*", "†", "‡", "§", "²", "ª"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFootnoteDraft({ ...footnoteDraft, marker: m })}
                  className={`min-w-8 rounded-md border px-2 py-1.5 text-sm transition ${
                    footnoteDraft.marker === m
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

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
                Insérer {footnoteDraft.marker.trim() || "…"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
