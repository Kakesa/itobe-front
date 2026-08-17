// Panneau latéral de détail + création rapide pour le calendrier éditorial.
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarClock, Copy, Move, Pencil, X } from "lucide-react";
import {
  LIBELLE_TYPE,
  TONS_STATUT,
  type ElementCalendrier,
  type TypeElement,
} from "@/lib/calendrier/editorial";

const TYPES: TypeElement[] = ["article", "actualite", "livre"];

const STATUTS_PAR_TYPE: Record<TypeElement, string[]> = {
  article: ["Brouillon", "En revue", "Programmé", "Publié", "Rejeté"],
  actualite: ["Brouillon", "En revue", "Programmé", "Publié", "Rejeté"],
  livre: ["En vente", "Épuisé"],
};

/** Panneau latéral : statut, dates clés et actions sur un élément. */
export function PanneauDetail({
  element,
  onFermer,
  onDeplacer,
  onDupliquer,
}: {
  element: ElementCalendrier;
  onFermer: () => void;
  onDeplacer: (e: ElementCalendrier, date: string) => void;
  onDupliquer: (e: ElementCalendrier) => void;
}) {
  const [date, setDate] = useState(element.date);
  useEffect(() => setDate(element.date), [element]);

  return (
    <aside className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {LIBELLE_TYPE[element.type]}
          </p>
          <h2 className="mt-1 font-display text-xl leading-tight">{element.titre}</h2>
        </div>
        <button
          type="button"
          aria-label="Fermer le panneau"
          onClick={onFermer}
          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary"
        >
          <X className="size-4" />
        </button>
      </div>

      <span
        className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs ${TONS_STATUT[element.statut]}`}
      >
        {element.statut}
      </span>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Date de publication</dt>
          <dd className="font-medium">{element.date}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Catégorie</dt>
          <dd>{element.categorie ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Auteur</dt>
          <dd>{element.auteur ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Identifiant</dt>
          <dd className="truncate text-muted-foreground">{element.id}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg border border-border p-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarClock className="size-4" />
          Déplacer vers une autre date
        </label>
        <div className="mt-2 flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(ev) => setDate(ev.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => onDeplacer(element, date)}
            disabled={!date || date === element.date}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-40"
          >
            <Move className="size-4" />
            Déplacer
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to={element.lien ?? "/admin"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary"
        >
          <Pencil className="size-4" />
          Modifier
        </Link>
        <button
          type="button"
          onClick={() => onDupliquer(element)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary"
        >
          <Copy className="size-4" />
          Dupliquer
        </button>
      </div>
    </aside>
  );
}

export type BrouillonRapide = {
  type: TypeElement;
  titre: string;
  date: string;
  statut: string;
  categorie: string;
  auteur: string;
};

/** Modale de création rapide (article, actualité ou livre). */
export function CreationRapide({
  dateInitiale,
  onFermer,
  onCreer,
}: {
  dateInitiale: string;
  onFermer: () => void;
  onCreer: (v: BrouillonRapide) => void;
}) {
  const [valeurs, setValeurs] = useState<BrouillonRapide>({
    type: "article",
    titre: "",
    date: dateInitiale,
    statut: "Programmé",
    categorie: "",
    auteur: "",
  });

  const maj = (p: Partial<BrouillonRapide>) => setValeurs((v) => ({ ...v, ...p }));
  const statuts = STATUTS_PAR_TYPE[valeurs.type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-xl">Programmer un contenu</h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onFermer}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valeurs.titre.trim() || !valeurs.date) return;
            onCreer(valeurs);
          }}
        >
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() =>
                  maj({ type: t, statut: STATUTS_PAR_TYPE[t][0] as string })
                }
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  valeurs.type === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {LIBELLE_TYPE[t]}
              </button>
            ))}
          </div>

          <label className="block text-sm">
            <span className="text-muted-foreground">Titre</span>
            <input
              value={valeurs.titre}
              onChange={(e) => maj({ titre: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Date</span>
              <input
                type="date"
                value={valeurs.date}
                onChange={(e) => maj({ date: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Statut</span>
              <select
                value={valeurs.statut}
                onChange={(e) => maj({ statut: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {statuts.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Catégorie</span>
              <input
                value={valeurs.categorie}
                onChange={(e) => maj({ categorie: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Auteur</span>
              <input
                value={valeurs.auteur}
                onChange={(e) => maj({ auteur: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onFermer}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              Programmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
