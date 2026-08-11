import { useMemo, useState, useRef, type ReactNode } from "react";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { AccesRestreint } from "@/components/admin-ui";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useRole } from "@/hooks/use-role";
import type { Role } from "@/lib/admin-data";
import { useCollection, type NomCollection } from "@/lib/admin/store";
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";

export type Colonne = {
  cle: string;
  label: string;
  rendu?: (row: Item) => ReactNode;
  classe?: string;
};

export type Champ = {
  nom: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "switch" | "date" | "image";
  options?: string[];
  requis?: boolean;
  placeholder?: string;
};

export function CrudModule({
  titre,
  singulier,
  description,
  collection,
  requis = ["admin"],
  colonnes,
  champs,
  clesRecherche = [],
  filtre,
  actionsLigne,
  entetePersonnalisee,
  lectureSeule = false,
}: {
  titre: string;
  singulier: string;
  description?: string;
  collection: NomCollection;
  requis?: Role[];
  colonnes: Colonne[];
  champs: Champ[];
  clesRecherche?: string[];
  filtre?: { cle: string; label: string; options: string[] };
  actionsLigne?: (row: Item) => ReactNode;
  entetePersonnalisee?: ReactNode;
  lectureSeule?: boolean;
}) {
  const { role } = useRole();
  const { items, creer, modifier, supprimer } = useCollection(collection);
  const [q, setQ] = useState("");
  const [valeurFiltre, setValeurFiltre] = useState("Tous");
  const [edition, setEdition] = useState<{ row: Item | null } | null>(null);
  const [aSupprimer, setASupprimer] = useState<Item | null>(null);

  const liste = useMemo(() => {
    const texte = q.trim().toLowerCase();
    return items.filter((row) => {
      const okFiltre =
        !filtre || valeurFiltre === "Tous" || String(row[filtre.cle] ?? "") === valeurFiltre;
      const okTexte =
        !texte ||
        clesRecherche.length === 0 ||
        clesRecherche.some((c) => String(row[c] ?? "").toLowerCase().includes(texte));
      return okFiltre && okTexte;
    });
  }, [items, q, valeurFiltre, filtre, clesRecherche]);

  if (!requis.includes(role)) return <AccesRestreint requis={requis} />;

  const libelle = (row: Item) =>
    String(row["titre"] ?? row["nom"] ?? row["code"] ?? row["email"] ?? row.id);

  const enregistrer = (valeurs: Record<string, unknown>) => {
    if (edition?.row) {
      modifier(edition.row.id, valeurs);
      notify.modifie(singulier, String(valeurs["titre"] ?? valeurs["nom"] ?? edition.row.id));
    } else {
      const item = creer(valeurs);
      notify.cree(singulier, libelle(item));
    }
    setEdition(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-2xl">{titre}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {clesRecherche.length > 0 && (
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher…"
            aria-label={`Rechercher dans ${titre}`}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
        )}
        {filtre && (
          <select
            value={valeurFiltre}
            onChange={(e) => setValeurFiltre(e.target.value)}
            aria-label={filtre.label}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          >
            {["Tous", ...filtre.options].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        )}
        {!lectureSeule && (
          <button
            type="button"
            onClick={() => setEdition({ row: null })}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" /> Ajouter
          </button>
        )}
      </div>

      {entetePersonnalisee}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {colonnes.map((c) => (
                <th key={c.cle} className="px-4 py-3 font-normal">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {liste.map((row) => (
              <tr key={row.id}>
                {colonnes.map((c) => (
                  <td key={c.cle} className={`px-4 py-3 ${c.classe ?? ""}`}>
                    {c.rendu ? c.rendu(row) : String(row[c.cle] ?? "—")}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                    {actionsLigne?.(row)}
                    <button
                      type="button"
                      onClick={() => setEdition({ row })}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 hover:bg-secondary"
                    >
                      <Pencil className="size-3.5" /> Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => setASupprimer(row)}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2.5 py-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" /> Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {liste.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Aucun élément ne correspond.</p>
      )}

      {edition && (
        <FormulaireDialog
          titre={edition.row ? `Modifier ${singulier.toLowerCase()}` : `Nouveau ${singulier.toLowerCase()}`}
          champs={champs}
          valeursInitiales={edition.row ?? {}}
          onAnnuler={() => setEdition(null)}
          onEnregistrer={enregistrer}
        />
      )}

      <ConfirmDialog
        ouvert={!!aSupprimer}
        titre={`Supprimer ${singulier.toLowerCase()} ?`}
        message={
          aSupprimer
            ? `« ${libelle(aSupprimer)} » sera définitivement retiré de la liste. Cette action est irréversible.`
            : ""
        }
        onAnnuler={() => {
          setASupprimer(null);
          notify.annule("Suppression annulée");
        }}
        onConfirmer={() => {
          if (aSupprimer) {
            const nom = libelle(aSupprimer);
            supprimer(aSupprimer.id);
            notify.supprime(singulier, nom);
          }
          setASupprimer(null);
        }}
      />
    </div>
  );
}

function FormulaireDialog({
  titre,
  champs,
  valeursInitiales,
  onAnnuler,
  onEnregistrer,
}: {
  titre: string;
  champs: Champ[];
  valeursInitiales: Partial<Item>;
  onAnnuler: () => void;
  onEnregistrer: (v: Record<string, unknown>) => void;
}) {
  const [valeurs, setValeurs] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(
      champs.map((c) => [
        c.nom,
        valeurInitiale(valeursInitiales[c.nom], c),
      ]),
    ),
  );

  const manquant = champs.some(
    (c) => c.requis && String(valeurs[c.nom] ?? "").trim() === "",
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
      <button type="button" aria-label="Fermer" className="absolute inset-0" onClick={onAnnuler} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manquant) {
            notify.erreur("Champs obligatoires manquants");
            return;
          }
          onEnregistrer(valeurs);
        }}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl"
      >
        <h3 className="font-display text-xl">{titre}</h3>
        <div className="mt-5 grid gap-4">
          {champs.map((c) => {
            const id = `champ-${c.nom}`;
            const commun =
              "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
            return (
              <div key={c.nom}>
                <label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">
                  {c.label}
                  {c.requis && " *"}
                </label>
                {c.type === "textarea" ? (
                  <textarea
                    id={id}
                    rows={3}
                    value={String(valeurs[c.nom] ?? "")}
                    placeholder={c.placeholder}
                    onChange={(e) => setValeurs((v) => ({ ...v, [c.nom]: e.target.value }))}
                    className={commun}
                  />
                ) : c.type === "select" ? (
                  <select
                    id={id}
                    value={String(valeurs[c.nom] ?? "")}
                    onChange={(e) => setValeurs((v) => ({ ...v, [c.nom]: e.target.value }))}
                    className={commun}
                  >
                    {(c.options ?? []).map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : c.type === "switch" ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      id={id}
                      type="checkbox"
                      checked={Boolean(valeurs[c.nom])}
                      onChange={(e) => setValeurs((v) => ({ ...v, [c.nom]: e.target.checked }))}
                      className="size-4"
                    />
                    {c.placeholder ?? "Activé"}
                  </label>
                ) : c.type === "image" ? (
                  <ChampImage
                    id={id}
                    valeur={String(valeurs[c.nom] ?? "")}
                    placeholder={c.placeholder}
                    onChange={(url) => setValeurs((v) => ({ ...v, [c.nom]: url }))}
                  />
                ) : (
                  <input
                    id={id}
                    type={c.type === "number" ? "number" : c.type === "date" ? "date" : "text"}
                    value={String(valeurs[c.nom] ?? "")}
                    placeholder={c.placeholder}
                    onChange={(e) =>
                      setValeurs((v) => ({
                        ...v,
                        [c.nom]: c.type === "number" ? Number(e.target.value) : e.target.value,
                      }))
                    }
                    className={commun}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onAnnuler}
            className="rounded-lg border border-border px-4 py-2 text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

function valeurInitiale(valeur: unknown, champ: Champ): unknown {
  if (valeur !== undefined && valeur !== null) return valeur;
  if (champ.type === "switch") return false;
  if (champ.type === "number") return 0;
  if (champ.type === "select") return champ.options?.[0] ?? "";
  return "";
}

function ChampImage({
  id,
  valeur,
  placeholder,
  onChange,
}: {
  id: string;
  valeur: string;
  placeholder?: string | undefined;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const urlAffichee = valeur.startsWith("data:") ? "" : valeur;

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          type="text"
          value={urlAffichee}
          placeholder={placeholder ?? "URL de l'image"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => onChange(String(reader.result));
            reader.readAsDataURL(f);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
        >
          <ImagePlus className="size-4" />
          Téléverser
        </button>
      </div>
      {valeur && (
        <div className="relative w-28 overflow-hidden rounded-lg border border-border">
          <img src={valeur} alt="Aperçu couverture" className="aspect-[2/3] w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/70 text-white"
            aria-label="Retirer la couverture"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}
