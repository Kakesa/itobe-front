import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart3, CalendarClock, Copy, Eye, Pencil, Plus, Trash2, XCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { BadgeCampagne } from "@/components/newsletter/newsletter-ui";
import { useCollection } from "@/lib/admin/store";
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";
import {
  LIBELLE_CAMPAGNE,
  STATUTS_CAMPAGNE,
  formatDateHeure,
  segmentParId,
  statsDe,
  taux,
} from "@/lib/newsletter/newsletter";

export const Route = createFileRoute("/admin/newsletter/campagnes")({
  component: CampagnesPage,
});

const input =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

function CampagnesPage() {
  const { items, creer, modifier, supprimer } = useCollection("campagnes");
  const { items: abonnes } = useCollection("abonnes");
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("Tous");
  const [aSupprimer, setASupprimer] = useState<Item | null>(null);

  const liste = useMemo(() => {
    const texte = q.trim().toLowerCase();
    return items
      .filter(
        (c) =>
          (statut === "Tous" || c["statut"] === statut) &&
          (!texte ||
            String(c["nom"] ?? "").toLowerCase().includes(texte) ||
            String(c["sujet"] ?? "").toLowerCase().includes(texte)),
      )
      .sort((a, b) => String(b["creee"]).localeCompare(String(a["creee"])));
  }, [items, q, statut]);

  const creerCampagne = () => {
    const item = creer({
      nom: "Nouvelle campagne",
      sujet: "",
      expediteur: "Itobe",
      emailExpediteur: "hello@itobe.cd",
      repondreA: "contact@itobe.cd",
      audience: "tous",
      template: "",
      statut: "DRAFT",
      creee: new Date().toISOString().slice(0, 16),
      envoiPrevu: "",
      envoyee: "",
      destinataires: 0,
      envoyes: 0,
      delivres: 0,
      ouvertures: 0,
      clics: 0,
      desabonnements: 0,
      blocs: [],
      journal: [{ date: new Date().toISOString().slice(0, 16), action: "Campagne créée" }],
    });
    notify.cree("Campagne", "Nouvelle campagne");
    void navigate({ to: "/admin/newsletter/campagne/$id", params: { id: item.id } });
  };

  const dupliquer = (c: Item) => {
    const { id: _ignore, ...reste } = c;
    const copie = creer({
      ...reste,
      nom: `${String(c["nom"])} (copie)`,
      statut: "DRAFT",
      creee: new Date().toISOString().slice(0, 16),
      envoiPrevu: "",
      envoyee: "",
      envoyes: 0,
      delivres: 0,
      ouvertures: 0,
      clics: 0,
      desabonnements: 0,
    });
    notify.cree("Campagne", String(copie["nom"]));
  };

  const annuler = (c: Item) => {
    modifier(c.id, { statut: "CANCELLED", envoiPrevu: "" });
    notify.attention("Campagne annulée", { description: String(c["nom"]) });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl">Campagnes</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher une campagne…"
          aria-label="Rechercher une campagne"
          className={input}
        />
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          aria-label="Filtrer par statut"
          className={input}
        >
          <option>Tous</option>
          {STATUTS_CAMPAGNE.map((s) => (
            <option key={s} value={s}>
              {LIBELLE_CAMPAGNE[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={creerCampagne}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" /> Créer une campagne
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {["Nom", "Sujet", "Audience", "Destinataires", "Création", "Envoi", "Statut", "Ouverture"].map(
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
            {liste.map((c) => {
              const s = statsDe(c);
              const seg = segmentParId(String(c["audience"]));
              const destinataires =
                s.destinataires || abonnes.filter(seg.filtre).length;
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/newsletter/campagne/$id"
                      params={{ id: c.id }}
                      className="font-medium hover:text-accent"
                    >
                      {String(c["nom"])}
                    </Link>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                    {String(c["sujet"] || "—")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{seg.label}</td>
                  <td className="px-4 py-3">{destinataires}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateHeure(c["creee"])}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateHeure(c["envoyee"] || c["envoiPrevu"])}
                  </td>
                  <td className="px-4 py-3">
                    <BadgeCampagne statut={String(c["statut"])} />
                  </td>
                  <td className="px-4 py-3">{s.delivres ? taux(s.ouvertures, s.delivres) : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                      <Link
                        to="/admin/newsletter/campagne/$id"
                        params={{ id: c.id }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 hover:bg-secondary"
                      >
                        {c["statut"] === "DRAFT" ? (
                          <>
                            <Pencil className="size-3.5" /> Modifier
                          </>
                        ) : c["statut"] === "SENT" ? (
                          <>
                            <BarChart3 className="size-3.5" /> Statistiques
                          </>
                        ) : (
                          <>
                            <Eye className="size-3.5" /> Voir
                          </>
                        )}
                      </Link>
                      <button
                        type="button"
                        onClick={() => dupliquer(c)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 hover:bg-secondary"
                      >
                        <Copy className="size-3.5" /> Dupliquer
                      </button>
                      {c["statut"] === "SCHEDULED" && (
                        <button
                          type="button"
                          onClick={() => annuler(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 hover:bg-secondary"
                        >
                          <XCircle className="size-3.5" /> Annuler
                        </button>
                      )}
                      {c["statut"] === "DRAFT" && (
                        <Link
                          to="/admin/newsletter/campagne/$id"
                          params={{ id: c.id }}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 hover:bg-secondary"
                        >
                          <CalendarClock className="size-3.5" /> Programmer
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => setASupprimer(c)}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2.5 py-1 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {liste.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Aucune campagne ne correspond.</p>
      )}

      <ConfirmDialog
        ouvert={!!aSupprimer}
        titre="Supprimer cette campagne ?"
        message={aSupprimer ? `« ${String(aSupprimer["nom"])} » sera définitivement supprimée.` : ""}
        onAnnuler={() => {
          setASupprimer(null);
          notify.annule("Suppression annulée");
        }}
        onConfirmer={() => {
          if (aSupprimer) {
            const nom = String(aSupprimer["nom"]);
            supprimer(aSupprimer.id);
            notify.supprime("Campagne", nom);
          }
          setASupprimer(null);
        }}
      />
    </div>
  );
}
