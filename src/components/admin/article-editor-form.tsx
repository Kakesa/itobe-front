import { useRef, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import { auteurs, categoriesMedia, nomAuteur } from "@/lib/data";
import { notify } from "@/lib/notify";

export type ArticleFormValues = {
  titre: string;
  resume: string;
  contenu: string;
  auteur: string;
  categorie: string;
  tags: string;
  youtube: string;
  couverture: string;
  galerie: string[];
  statut: "Brouillon" | "Programmé" | "Publié";
  aLaUne: boolean;
  datePublication?: string;
};

const VIDE: ArticleFormValues = {
  titre: "",
  resume: "",
  contenu: "",
  auteur: auteurs[0]?.slug ?? "",
  categorie: "Actualités",
  tags: "",
  youtube: "",
  couverture: "",
  galerie: [],
  statut: "Brouillon",
  aLaUne: false,
  datePublication: "",
};

const champ =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";
const label = "mb-1.5 block text-sm font-medium text-foreground";

export function ArticleEditorForm({
  initial,
  onAnnuler,
  onEnregistrer,
}: {
  initial?: (Partial<ArticleFormValues> & { id?: string }) | undefined;
  onAnnuler: () => void;
  onEnregistrer: (v: ArticleFormValues) => void;
}) {
  const [v, setV] = useState<ArticleFormValues>(() => ({
    ...VIDE,
    ...initial,
    galerie: initial?.galerie ?? [],
  }));
  const [programmer, setProgrammer] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const galerieRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ArticleFormValues>(cle: K, val: ArticleFormValues[K]) =>
    setV((s) => ({ ...s, [cle]: val }));

  const valider = (statut: ArticleFormValues["statut"]) => {
    if (!v.titre.trim()) {
      notify.erreur("Le titre est obligatoire");
      return;
    }
    if (!v.resume.trim()) {
      notify.erreur("Le résumé est obligatoire");
      return;
    }
    if (statut === "Programmé" && !v.datePublication) {
      notify.erreur("Choisissez une date de publication");
      return;
    }
    onEnregistrer({ ...v, statut });
  };

  const lireFichier = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => cb(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Contenu
          </p>
          <h2 className="mt-1 font-display text-3xl">
            {initial?.id ? "Modifier l'article" : "Créer un article"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onAnnuler}
          className="rounded-lg border border-border px-4 py-2 text-sm"
        >
          Retour à la liste
        </button>
      </div>

      <form
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-soft md:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          valider(v.statut === "Publié" ? "Publié" : "Brouillon");
        }}
      >
        <div>
          <label htmlFor="art-titre" className={label}>
            Titre
          </label>
          <input
            id="art-titre"
            required
            value={v.titre}
            onChange={(e) => set("titre", e.target.value)}
            placeholder="Titre de l'article"
            className={champ}
          />
        </div>

        <div>
          <label htmlFor="art-resume" className={label}>
            Résumé
          </label>
          <textarea
            id="art-resume"
            required
            rows={3}
            value={v.resume}
            onChange={(e) => set("resume", e.target.value)}
            placeholder="Court résumé affiché en une et dans les listes"
            className={champ}
          />
        </div>

        <div>
          <label htmlFor="art-contenu" className={label}>
            Contenu
          </label>
          <textarea
            id="art-contenu"
            rows={14}
            value={v.contenu}
            onChange={(e) => set("contenu", e.target.value)}
            placeholder="Rédigez le corps de l'article…"
            className={`${champ} min-h-[280px] font-sans leading-relaxed`}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="art-auteur" className={label}>
              Auteur
            </label>
            <select
              id="art-auteur"
              value={v.auteur}
              onChange={(e) => set("auteur", e.target.value)}
              className={champ}
            >
              {auteurs.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="art-cat" className={label}>
              Catégorie
            </label>
            <select
              id="art-cat"
              value={v.categorie}
              onChange={(e) => set("categorie", e.target.value)}
              className={champ}
            >
              {categoriesMedia.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="art-tags" className={label}>
            Tags (virgules)
          </label>
          <input
            id="art-tags"
            value={v.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="culture, kinshasa, édition"
            className={champ}
          />
        </div>

        <div>
          <label htmlFor="art-yt" className={label}>
            Vidéo YouTube
          </label>
          <input
            id="art-yt"
            value={v.youtube}
            onChange={(e) => set("youtube", e.target.value)}
            placeholder="URL ou embed"
            className={champ}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Collez un lien YouTube ou un code d&apos;intégration.
          </p>
        </div>

        <div>
          <label htmlFor="art-cover" className={label}>
            Image de couverture
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="art-cover"
              value={v.couverture.startsWith("data:") ? "" : v.couverture}
              onChange={(e) => set("couverture", e.target.value)}
              placeholder="URL"
              className={`${champ} flex-1`}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) lireFichier(f, (url) => set("couverture", url));
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-secondary"
            >
              <ImagePlus className="size-4" />
              Téléverser
            </button>
          </div>
          {v.couverture && (
            <div className="relative mt-3 overflow-hidden rounded-lg border border-border">
              <img
                src={v.couverture}
                alt="Aperçu couverture"
                className="h-40 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => set("couverture", "")}
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ink/70 text-white"
                aria-label="Retirer la couverture"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>

        <div>
          <p className={label}>Galerie</p>
          <input
            ref={galerieRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              files.forEach((f) =>
                lireFichier(f, (url) =>
                  setV((s) => ({ ...s, galerie: [...s.galerie, url] })),
                ),
              );
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => galerieRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-accent hover:text-foreground"
          >
            <Plus className="size-4" />
            Ajouter des images
          </button>
          {v.galerie.length > 0 && (
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {v.galerie.map((src, i) => (
                <li key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                  <img src={src} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "galerie",
                        v.galerie.filter((_, j) => j !== i),
                      )
                    }
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/70 text-white"
                    aria-label="Retirer l'image"
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <label htmlFor="art-statut" className={label}>
              Statut
            </label>
            <select
              id="art-statut"
              value={v.statut}
              onChange={(e) =>
                set("statut", e.target.value as ArticleFormValues["statut"])
              }
              className={champ}
            >
              <option value="Brouillon">Brouillon</option>
              <option value="Programmé">Programmé</option>
              <option value="Publié">Publié</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2.5 pb-2.5 text-sm">
              <input
                type="checkbox"
                checked={v.aLaUne}
                onChange={(e) => set("aLaUne", e.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Mettre à la une
            </label>
          </div>
        </div>

        {programmer && (
          <div>
            <label htmlFor="art-date" className={label}>
              Date de publication
            </label>
            <input
              id="art-date"
              type="datetime-local"
              value={v.datePublication ?? ""}
              onChange={(e) => set("datePublication", e.target.value)}
              className={champ}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => valider("Brouillon")}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Brouillon
          </button>
          <button
            type="button"
            onClick={() => {
              if (!programmer) {
                setProgrammer(true);
                set("statut", "Programmé");
                notify.info("Choisissez une date de publication");
                return;
              }
              valider("Programmé");
            }}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Programmer
          </button>
          <button
            type="button"
            onClick={() => valider("Publié")}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Publier
          </button>
          <button
            type="button"
            onClick={() => valider(v.statut === "Publié" ? "Publié" : "Brouillon")}
            className="ml-auto rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            {initial?.id ? "Enregistrer" : "Créer"}
          </button>
        </div>

        {initial?.id && (
          <p className="text-xs text-muted-foreground">
            Auteur actuel : {nomAuteur(v.auteur)}
          </p>
        )}
      </form>
    </div>
  );
}

export function articleVersForm(row: Record<string, unknown>): ArticleFormValues & { id: string } {
  return {
    id: String(row["id"]),
    titre: String(row["titre"] ?? ""),
    resume: String(row["resume"] ?? row["chapo"] ?? ""),
    contenu: String(row["contenu"] ?? ""),
    auteur: String(row["auteur"] ?? auteurs[0]?.slug ?? ""),
    categorie: String(row["categorie"] ?? "Actualités"),
    tags: Array.isArray(row["tags"]) ? row["tags"].join(", ") : String(row["tags"] ?? ""),
    youtube: String(row["youtube"] ?? ""),
    couverture: String(row["couverture"] ?? row["image"] ?? ""),
    galerie: Array.isArray(row["galerie"]) ? (row["galerie"] as string[]) : [],
    statut: (["Brouillon", "Programmé", "Publié"].includes(String(row["statut"] ?? row["etat"]))
      ? String(row["statut"] ?? row["etat"])
      : "Brouillon") as ArticleFormValues["statut"],
    aLaUne: Boolean(row["aLaUne"] ?? row["populaire"]),
    datePublication: String(row["datePublication"] ?? ""),
  };
}

export function formVersItem(v: ArticleFormValues): Record<string, unknown> {
  return {
    titre: v.titre.trim(),
    chapo: v.resume.trim(),
    resume: v.resume.trim(),
    contenu: v.contenu,
    auteur: v.auteur,
    categorie: v.categorie,
    tags: v.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    youtube: v.youtube.trim(),
    couverture: v.couverture,
    image: v.couverture,
    galerie: v.galerie,
    statut: v.statut,
    etat: v.statut === "Publié" ? "Publié" : v.statut === "Programmé" ? "En revue" : "Brouillon",
    aLaUne: v.aLaUne,
    populaire: v.aLaUne,
    datePublication: v.datePublication || undefined,
    date: v.datePublication?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    lecture: "5 min",
  };
}
