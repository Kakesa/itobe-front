import { useMemo, useRef, useState } from "react";
import { Download, Pencil, Plus, Trash2, Upload, UserMinus } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { RowActionsMenu } from "@/components/admin/row-actions-menu";
import { BadgeAbonne } from "@/components/newsletter/newsletter-ui";
import { useCollection } from "@/lib/admin/store";
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";
import {
  LIBELLE_ABONNE,
  SOURCES_ABONNE,
  STATUTS_ABONNE,
  segments,
  tailleSegment,
  type StatutAbonne,
} from "@/lib/newsletter/newsletter";
import { formatDate } from "@/lib/data";

const input =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

export function AbonnesPanel() {
  const { items, creer, modifier, supprimer } = useCollection("abonnes");
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("Tous");
  const [segment, setSegment] = useState("tous");
  const [edition, setEdition] = useState<{ row: Item | null } | null>(null);
  const [aSupprimer, setASupprimer] = useState<Item | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const liste = useMemo(() => {
    const texte = q.trim().toLowerCase();
    const seg = segments.find((s) => s.id === segment);
    return items.filter((a) => {
      const okTexte =
        !texte ||
        String(a["nom"] ?? "").toLowerCase().includes(texte) ||
        String(a["email"] ?? "").toLowerCase().includes(texte);
      const okStatut = statut === "Tous" || a["statut"] === statut;
      const okSeg = segment === "tous" || !seg || seg.filtre(a);
      return okTexte && okStatut && okSeg;
    });
  }, [items, q, statut, segment]);

  const exporter = () => {
    const entetes = ["nom", "email", "statut", "inscription", "interaction", "source"];
    const csv = [
      entetes.join(","),
      ...liste.map((a) => entetes.map((c) => `"${String(a[c] ?? "")}"`).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = "abonnes-itobe.csv";
    lien.click();
    URL.revokeObjectURL(url);
    notify.succes("Export CSV généré", { description: `${liste.length} abonné(s)` });
  };

  const importer = (fichier: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const lignes = String(reader.result)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(1);
      let ajoutes = 0;
      lignes.forEach((ligne) => {
        const cols = ligne.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        const email = cols.find((c) => c.includes("@"));
        if (!email || items.some((a) => a["email"] === email)) return;
        creer({
          nom: cols[0] && !cols[0].includes("@") ? cols[0] : email.split("@")[0],
          email,
          statut: "ACTIVE",
          inscription: new Date().toISOString().slice(0, 10),
          interaction: new Date().toISOString().slice(0, 10),
          source: "Import",
          interet: "Média",
          achats: 0,
          premium: false,
        });
        ajoutes += 1;
      });
      ajoutes > 0
        ? notify.succes("Import terminé", { description: `${ajoutes} abonné(s) ajouté(s)` })
        : notify.attention("Aucun nouvel abonné importé");
    };
    reader.readAsText(fichier);
  };

  const desabonner = (a: Item) => {
    modifier(a.id, { statut: "UNSUBSCRIBED", interaction: new Date().toISOString().slice(0, 10) });
    notify.succes("Abonné désabonné", {
      description: `${String(a["email"])} ne recevra plus de campagne marketing.`,
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl">Abonnés</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un abonné…"
          aria-label="Rechercher un abonné"
          className={input}
        />
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          aria-label="Filtrer par statut"
          className={input}
        >
          <option>Tous</option>
          {STATUTS_ABONNE.map((s) => (
            <option key={s} value={s}>
              {LIBELLE_ABONNE[s]}
            </option>
          ))}
        </select>
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          aria-label="Filtrer par segment"
          className={input}
        >
          {segments.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} ({tailleSegment(items, s.id)})
            </option>
          ))}
        </select>
        <div className="ml-auto flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importer(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
          >
            <Upload className="size-4" /> Importer
          </button>
          <button
            type="button"
            onClick={exporter}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
          >
            <Download className="size-4" /> Exporter
          </button>
          <button
            type="button"
            onClick={() => setEdition({ row: null })}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4" /> Ajouter
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Le consentement est respecté : un abonné désabonné, en rebond ou bloqué est exclu de tout
        envoi marketing.
      </p>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {["Nom", "E-mail", "Statut", "Inscription", "Dernière interaction", "Source"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-normal">
                    {h}
                  </th>
                ),
              )}
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {liste.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">{String(a["nom"] ?? "—")}</td>
                <td className="px-4 py-3 text-muted-foreground">{String(a["email"])}</td>
                <td className="px-4 py-3">
                  <BadgeAbonne statut={String(a["statut"])} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(String(a["inscription"]))}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(String(a["interaction"]))}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{String(a["source"] ?? "—")}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActionsMenu
                      actions={[
                        {
                          label: "Désabonner",
                          icon: UserMinus,
                          hidden: a["statut"] !== "ACTIVE",
                          onClick: () => desabonner(a),
                        },
                        {
                          label: "Modifier",
                          icon: Pencil,
                          onClick: () => setEdition({ row: a }),
                        },
                        {
                          label: "Supprimer",
                          icon: Trash2,
                          destructive: true,
                          separatorBefore: true,
                          onClick: () => setASupprimer(a),
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {liste.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Aucun abonné ne correspond.</p>
      )}

      {edition && (
        <FormulaireAbonne
          initial={edition.row}
          onAnnuler={() => setEdition(null)}
          onEnregistrer={(v) => {
            if (edition.row) {
              modifier(edition.row.id, v);
              notify.modifie("Abonné", String(v["email"]));
            } else {
              creer(v);
              notify.cree("Abonné", String(v["email"]));
            }
            setEdition(null);
          }}
        />
      )}

      <ConfirmDialog
        ouvert={!!aSupprimer}
        titre="Supprimer cet abonné ?"
        message={
          aSupprimer
            ? `« ${String(aSupprimer["email"])} » sera retiré définitivement de la base.`
            : ""
        }
        onAnnuler={() => {
          setASupprimer(null);
          notify.annule("Suppression annulée");
        }}
        onConfirmer={() => {
          if (aSupprimer) {
            const email = String(aSupprimer["email"]);
            supprimer(aSupprimer.id);
            notify.supprime("Abonné", email);
          }
          setASupprimer(null);
        }}
      />
    </div>
  );
}

function FormulaireAbonne({
  initial,
  onAnnuler,
  onEnregistrer,
}: {
  initial: Item | null;
  onAnnuler: () => void;
  onEnregistrer: (v: Record<string, unknown>) => void;
}) {
  const [v, setV] = useState<Record<string, unknown>>(() => ({
    nom: initial?.["nom"] ?? "",
    email: initial?.["email"] ?? "",
    statut: (initial?.["statut"] as StatutAbonne) ?? "ACTIVE",
    inscription: initial?.["inscription"] ?? new Date().toISOString().slice(0, 10),
    interaction: initial?.["interaction"] ?? new Date().toISOString().slice(0, 10),
    source: initial?.["source"] ?? "Ajout manuel",
    interet: initial?.["interet"] ?? "Média",
    achats: initial?.["achats"] ?? 0,
    premium: initial?.["premium"] ?? false,
  }));

  const set = (k: string, val: unknown) => setV((s) => ({ ...s, [k]: val }));
  const champ = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
      <button type="button" aria-label="Fermer" className="absolute inset-0" onClick={onAnnuler} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!String(v["email"]).includes("@")) {
            notify.erreur("E-mail invalide");
            return;
          }
          onEnregistrer(v);
        }}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl"
      >
        <h3 className="font-display text-xl">{initial ? "Modifier l'abonné" : "Nouvel abonné"}</h3>
        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="ab-nom" className="mb-1 block text-xs text-muted-foreground">
              Nom
            </label>
            <input id="ab-nom" value={String(v["nom"])} onChange={(e) => set("nom", e.target.value)} className={champ} />
          </div>
          <div>
            <label htmlFor="ab-mail" className="mb-1 block text-xs text-muted-foreground">
              E-mail *
            </label>
            <input id="ab-mail" value={String(v["email"])} onChange={(e) => set("email", e.target.value)} className={champ} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ab-statut" className="mb-1 block text-xs text-muted-foreground">
                Statut
              </label>
              <select id="ab-statut" value={String(v["statut"])} onChange={(e) => set("statut", e.target.value)} className={champ}>
                {STATUTS_ABONNE.map((s) => (
                  <option key={s} value={s}>
                    {LIBELLE_ABONNE[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ab-source" className="mb-1 block text-xs text-muted-foreground">
                Source
              </label>
              <select id="ab-source" value={String(v["source"])} onChange={(e) => set("source", e.target.value)} className={champ}>
                {SOURCES_ABONNE.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ab-insc" className="mb-1 block text-xs text-muted-foreground">
                Inscription
              </label>
              <input id="ab-insc" type="date" value={String(v["inscription"])} onChange={(e) => set("inscription", e.target.value)} className={champ} />
            </div>
            <div>
              <label htmlFor="ab-inter" className="mb-1 block text-xs text-muted-foreground">
                Dernière interaction
              </label>
              <input id="ab-inter" type="date" value={String(v["interaction"])} onChange={(e) => set("interaction", e.target.value)} className={champ} />
            </div>
            <div>
              <label htmlFor="ab-interet" className="mb-1 block text-xs text-muted-foreground">
                Intérêt
              </label>
              <select id="ab-interet" value={String(v["interet"])} onChange={(e) => set("interet", e.target.value)} className={champ}>
                <option>Média</option>
                <option>Édition</option>
              </select>
            </div>
            <div>
              <label htmlFor="ab-achats" className="mb-1 block text-xs text-muted-foreground">
                Achats
              </label>
              <input id="ab-achats" type="number" value={Number(v["achats"])} onChange={(e) => set("achats", Number(e.target.value))} className={champ} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(v["premium"])}
              onChange={(e) => set("premium", e.target.checked)}
              className="size-4"
            />
            Abonné premium
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onAnnuler} className="rounded-lg border border-border px-4 py-2 text-sm">
            Annuler
          </button>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
