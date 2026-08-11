// Composants partagés du module Newsletter (badges, cartes stats, éditeur, aperçu).
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  LIBELLE_ABONNE,
  LIBELLE_BLOC,
  LIBELLE_CAMPAGNE,
  TON_ABONNE,
  TON_CAMPAGNE,
  TYPES_BLOC,
  nouveauBloc,
  type Bloc,
  type StatutAbonne,
  type StatutCampagne,
  type TypeBloc,
} from "@/lib/newsletter/newsletter";

export function BadgeCampagne({ statut }: { statut: string }) {
  const s = statut as StatutCampagne;
  const ton = TON_CAMPAGNE[s] ?? "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${ton}`}>
      {LIBELLE_CAMPAGNE[s] ?? statut}
    </span>
  );
}

export function BadgeAbonne({ statut }: { statut: string }) {
  const s = statut as StatutAbonne;
  const ton = TON_ABONNE[s] ?? "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${ton}`}>
      {LIBELLE_ABONNE[s] ?? statut}
    </span>
  );
}

export function CarteStat({
  label,
  valeur,
  hint,
  icone,
}: {
  label: string;
  valeur: string | number;
  hint?: string;
  icone?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icone && <span className="text-muted-foreground">{icone}</span>}
      </div>
      <p className="mt-2 font-display text-2xl tracking-tight md:text-3xl">{valeur}</p>
      {hint && <p className="mt-1 text-xs text-accent">{hint}</p>}
    </div>
  );
}

/* ------------------------- Éditeur de blocs ------------------------- */

const input =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

export function NewsletterEditor({
  blocs,
  onChange,
}: {
  blocs: Bloc[];
  onChange: (b: Bloc[]) => void;
}) {
  const set = (id: string, patch: Partial<Bloc>) =>
    onChange(blocs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const deplacer = (index: number, delta: number) => {
    const cible = index + delta;
    if (cible < 0 || cible >= blocs.length) return;
    const copie = [...blocs];
    const [item] = copie.splice(index, 1);
    if (item) copie.splice(cible, 0, item);
    onChange(copie);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TYPES_BLOC.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange([...blocs, nouveauBloc(t as TypeBloc)])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary"
          >
            <Plus className="size-3.5" /> {LIBELLE_BLOC[t as TypeBloc]}
          </button>
        ))}
      </div>

      {blocs.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Ajoutez un premier bloc pour composer votre newsletter.
        </p>
      )}

      <ul className="space-y-3">
        {blocs.map((b, i) => (
          <li key={b.id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <GripVertical className="size-4 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {LIBELLE_BLOC[b.type]}
              </p>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Monter le bloc"
                  onClick={() => deplacer(i, -1)}
                  className="grid size-7 place-items-center rounded-lg border border-border hover:bg-secondary"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Descendre le bloc"
                  onClick={() => deplacer(i, 1)}
                  className="grid size-7 place-items-center rounded-lg border border-border hover:bg-secondary"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Supprimer le bloc"
                  onClick={() => onChange(blocs.filter((x) => x.id !== b.id))}
                  className="grid size-7 place-items-center rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              {(b.type === "TEXT" || b.type === "ARTICLE" || b.type === "BOOK") && (
                <input
                  value={b.titre ?? ""}
                  onChange={(e) => set(b.id, { titre: e.target.value })}
                  placeholder="Titre"
                  className={input}
                />
              )}
              {b.type === "TEXT" && (
                <input
                  value={b.sousTitre ?? ""}
                  onChange={(e) => set(b.id, { sousTitre: e.target.value })}
                  placeholder="Sous-titre"
                  className={input}
                />
              )}
              {(b.type === "TEXT" || b.type === "FOOTER" || b.type === "SOCIAL_LINKS" || b.type === "IMAGE") && (
                <textarea
                  rows={b.type === "TEXT" ? 4 : 2}
                  value={b.texte ?? ""}
                  onChange={(e) => set(b.id, { texte: e.target.value })}
                  placeholder={b.type === "IMAGE" ? "Légende" : "Texte"}
                  className={input}
                />
              )}
              {b.type === "IMAGE" && (
                <input
                  value={b.image ?? ""}
                  onChange={(e) => set(b.id, { image: e.target.value })}
                  placeholder="URL de l'image"
                  className={input}
                />
              )}
              {(b.type === "ARTICLE" || b.type === "BOOK") && (
                <input
                  value={b.reference ?? ""}
                  onChange={(e) => set(b.id, { reference: e.target.value })}
                  placeholder={b.type === "ARTICLE" ? "Slug de l'article" : "Slug du livre"}
                  className={input}
                />
              )}
              {(b.type === "BUTTON" || b.type === "ARTICLE" || b.type === "BOOK") && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={b.libelleLien ?? ""}
                    onChange={(e) => set(b.id, { libelleLien: e.target.value })}
                    placeholder="Libellé du bouton"
                    className={input}
                  />
                  <input
                    value={b.lien ?? ""}
                    onChange={(e) => set(b.id, { lien: e.target.value })}
                    placeholder="https://…"
                    className={input}
                  />
                </div>
              )}
              {b.type === "DIVIDER" && (
                <p className="text-xs text-muted-foreground">Séparateur horizontal.</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------- Aperçu e-mail ------------------------- */

export function NewsletterPreview({
  sujet,
  expediteur,
  blocs,
}: {
  sujet: string;
  expediteur: string;
  blocs: Bloc[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/40 p-4">
      <div className="mx-auto max-w-[560px] overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="border-b border-border bg-primary px-5 py-4 text-primary-foreground">
          <p className="font-display text-xl">
            Itobe<span className="text-ochre">.</span>
          </p>
          <p className="mt-0.5 text-[0.7rem] uppercase tracking-[0.14em] text-primary-foreground/70">
            {expediteur || "Itobe Entreprise"}
          </p>
        </div>
        <div className="px-5 py-3">
          <p className="text-xs text-muted-foreground">Objet</p>
          <p className="font-medium">{sujet || "(sans objet)"}</p>
        </div>
        <div className="space-y-4 border-t border-border px-5 py-5">
          {blocs.map((b) => (
            <BlocApercu key={b.id} bloc={b} />
          ))}
          {blocs.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun contenu pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function BlocApercu({ bloc: b }: { bloc: Bloc }) {
  switch (b.type) {
    case "TEXT":
      return (
        <div>
          {b.titre && <h3 className="font-display text-xl">{b.titre}</h3>}
          {b.sousTitre && <p className="text-sm text-muted-foreground">{b.sousTitre}</p>}
          {b.texte && <p className="mt-2 text-sm leading-relaxed">{b.texte}</p>}
        </div>
      );
    case "IMAGE":
      return (
        <figure>
          {b.image ? (
            <img src={b.image} alt={b.texte ?? ""} className="w-full rounded-lg object-cover" />
          ) : (
            <div className="grid h-36 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
              Image
            </div>
          )}
          {b.texte && <figcaption className="mt-1 text-xs text-muted-foreground">{b.texte}</figcaption>}
        </figure>
      );
    case "BUTTON":
      return (
        <p>
          <span className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
            {b.libelleLien || "Bouton"}
          </span>
        </p>
      );
    case "ARTICLE":
    case "BOOK":
      return (
        <div className="rounded-lg border border-border p-3">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            {b.type === "ARTICLE" ? "Article" : "Livre"}
          </p>
          <p className="mt-1 font-medium">{b.titre || "Contenu Itobe"}</p>
          {b.reference && <p className="text-xs text-muted-foreground">{b.reference}</p>}
          {b.libelleLien && <p className="mt-2 text-xs text-accent">{b.libelleLien} →</p>}
        </div>
      );
    case "DIVIDER":
      return <hr className="border-border" />;
    case "SOCIAL_LINKS":
      return <p className="text-center text-xs text-muted-foreground">{b.texte}</p>;
    case "FOOTER":
      return (
        <p className="border-t border-border pt-3 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
          {b.texte}
        </p>
      );
  }
}
