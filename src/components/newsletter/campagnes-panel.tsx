import { useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarClock,
  Copy,
  Eye,
  Pencil,
  Plus,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { RowActionsMenu } from "@/components/admin/row-actions-menu";
import { BadgeCampagne } from "@/components/newsletter/newsletter-ui";
import { useCollection } from "@/lib/admin/store";
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";
import { useNotifierAbonnes } from "@/hooks/use-notifier-abonnes";
import {
  LIBELLE_CAMPAGNE,
  STATUTS_CAMPAGNE,
  blocsDe,
  formatDateHeure,
  segmentParId,
  statsDe,
  taux,
} from "@/lib/newsletter/newsletter";

const input =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

export function CampagnesPanel() {
  const { items, creer, modifier, supprimer } = useCollection("campagnes");
  const { items: abonnes } = useCollection("abonnes");
  const { notifier, abonnesActifs } = useNotifierAbonnes();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("Tous");
  const [typeFiltre, setTypeFiltre] = useState<"Tous" | "marketing" | "notification">("Tous");
  const [aSupprimer, setASupprimer] = useState<Item | null>(null);
  const [tplNotif, setTplNotif] = useState("");
  const [envoiNotif, setEnvoiNotif] = useState(false);

  const { items: templates } = useCollection("templates");
  const templatesNotif = useMemo(
    () =>
      templates.filter(
        (t) =>
          String(t["categorie"]) === "Notification" ||
          String(t["id"]).startsWith("tpl-notif") ||
          String(t["id"]) === "tpl-bienvenue",
      ),
    [templates],
  );
  const templatesMarketing = useMemo(
    () => templates.filter((t) => !templatesNotif.some((n) => n.id === t.id)),
    [templates, templatesNotif],
  );

  const liste = useMemo(() => {
    const texte = q.trim().toLowerCase();
    return items
      .filter((c) => {
        const type = String(c["type"] ?? "marketing");
        return (
          (statut === "Tous" || c["statut"] === statut) &&
          (typeFiltre === "Tous" || type === typeFiltre) &&
          (!texte ||
            String(c["nom"] ?? "").toLowerCase().includes(texte) ||
            String(c["sujet"] ?? "").toLowerCase().includes(texte))
        );
      })
      .sort((a, b) => String(b["creee"]).localeCompare(String(a["creee"])));
  }, [items, q, statut, typeFiltre]);

  const creerCampagne = (tplId?: string) => {
    const tpl = templates.find((t) => t.id === (tplId || templatesMarketing[0]?.id));
    const item = creer({
      nom: tpl ? String(tpl["nom"]) : "Nouvelle campagne",
      sujet: tpl ? String(tpl["sujet"] ?? "") : "",
      type: "marketing",
      expediteur: "Itobe",
      emailExpediteur: "hello@itobe.cd",
      repondreA: "contact@itobe.cd",
      audience: "tous",
      template: tpl?.id ?? "",
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
      blocs: tpl ? blocsDe(tpl["blocs"]) : [],
      journal: [
        {
          date: new Date().toISOString().slice(0, 16),
          action: tpl ? `Créée depuis le template « ${tpl["nom"]} »` : "Campagne créée",
        },
      ],
    });
    notify.cree("Campagne", String(item["nom"]));
    void navigate({ to: "/admin/media/newsletter/campagne/$id", params: { id: item.id } });
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
      journal: [
        {
          date: new Date().toISOString().slice(0, 16),
          action: "Campagne dupliquée",
        },
      ],
    });
    notify.cree("Campagne", String(copie["nom"]));
  };

  const annuler = (c: Item) => {
    modifier(c.id, { statut: "CANCELLED" });
    notify.attention("Campagne annulée", { description: String(c["nom"]) });
  };

  const envoyerNotification = () => {
    const id = tplNotif || templatesNotif[0]?.id;
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) {
      notify.erreur("Choisissez un template de notification");
      return;
    }
    const res = notifier({
      type: "manuelle",
      titre: String(tpl["nom"]),
      sujet: String(tpl["sujet"] ?? tpl["nom"]),
      blocs: blocsDe(tpl["blocs"]),
      templateId: tpl.id,
    });
    if (res) {
      setEnvoiNotif(false);
      setTypeFiltre("notification");
    }
  };

  const tplSelectionne = templates.find((t) => t.id === (tplNotif || templatesNotif[0]?.id));

  return (
    <div>
      <section className="rounded-xl border border-accent/30 bg-accent/5 p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-accent/15 text-accent">
            <Bell className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl">Campagne de notification</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Envoyez un e-mail immédiat aux {abonnesActifs} abonné(s) ACTIVE. Les publications
              d&apos;articles et de livres déclenchent aussi automatiquement une notification.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEnvoiNotif((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            <Send className="size-4" />
            {envoiNotif ? "Fermer" : "Nouvelle notification"}
          </button>
        </div>

        {envoiNotif && (
          <div className="mt-5 space-y-4 border-t border-accent/20 pt-5">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Choisir un template déjà rédigé
                </label>
                <select
                  value={tplNotif || templatesNotif[0]?.id || ""}
                  onChange={(e) => setTplNotif(e.target.value)}
                  className={`${input} w-full`}
                >
                  {templatesNotif.map((t) => (
                    <option key={t.id} value={t.id}>
                      {String(t["nom"])} — {String(t["sujet"] ?? "")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={envoyerNotification}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 md:w-auto"
                >
                  <Send className="size-4" /> Envoyer maintenant
                </button>
              </div>
            </div>
            {tplSelectionne && (
              <div className="rounded-lg border border-border bg-background/80 p-4 text-sm">
                <p className="font-medium">{String(tplSelectionne["sujet"])}</p>
                <p className="mt-1 text-muted-foreground">
                  {String(tplSelectionne["description"])}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Usage : {String(tplSelectionne["usage"] ?? "—")}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher une campagne…"
          aria-label="Rechercher une campagne"
          className={input}
        />
        <select
          value={typeFiltre}
          onChange={(e) => setTypeFiltre(e.target.value as typeof typeFiltre)}
          aria-label="Filtrer par type"
          className={input}
        >
          <option value="Tous">Tous les types</option>
          <option value="marketing">Marketing</option>
          <option value="notification">Notifications</option>
        </select>
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
          onClick={() => creerCampagne()}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" /> Créer depuis un template
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {[
                "Nom",
                "Type",
                "Sujet",
                "Audience",
                "Destinataires",
                "Création",
                "Envoi",
                "Statut",
                "Ouverture",
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {liste.map((c) => {
              const s = statsDe(c);
              const seg = segmentParId(String(c["audience"]));
              const destinataires = s.destinataires || abonnes.filter(seg.filtre).length;
              const type = String(c["type"] ?? "marketing");
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/media/newsletter/campagne/$id"
                      params={{ id: c.id }}
                      className="font-medium hover:text-accent"
                    >
                      {String(c["nom"])}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide ${
                        type === "notification"
                          ? "bg-accent/15 text-accent"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {type === "notification" ? "Notification" : "Marketing"}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                    {String(c["sujet"] || "—")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{seg.label}</td>
                  <td className="px-4 py-3">{destinataires}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateHeure(c["creee"])}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateHeure(c["envoyee"] || c["envoiPrevu"])}
                  </td>
                  <td className="px-4 py-3">
                    <BadgeCampagne statut={String(c["statut"])} />
                  </td>
                  <td className="px-4 py-3">
                    {s.delivres ? taux(s.ouvertures, s.delivres) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <RowActionsMenu
                        actions={[
                          {
                            label:
                              c["statut"] === "DRAFT"
                                ? "Modifier"
                                : c["statut"] === "SENT"
                                  ? "Statistiques"
                                  : "Voir",
                            icon:
                              c["statut"] === "DRAFT"
                                ? Pencil
                                : c["statut"] === "SENT"
                                  ? BarChart3
                                  : Eye,
                            onClick: () =>
                              void navigate({
                                to: "/admin/media/newsletter/campagne/$id",
                                params: { id: c.id },
                              }),
                          },
                          {
                            label: "Dupliquer",
                            icon: Copy,
                            onClick: () => dupliquer(c),
                          },
                          {
                            label: "Annuler",
                            icon: XCircle,
                            hidden: c["statut"] !== "SCHEDULED",
                            onClick: () => annuler(c),
                          },
                          {
                            label: "Programmer",
                            icon: CalendarClock,
                            hidden: c["statut"] !== "DRAFT",
                            onClick: () =>
                              void navigate({
                                to: "/admin/media/newsletter/campagne/$id",
                                params: { id: c.id },
                              }),
                          },
                          {
                            label: "Supprimer",
                            icon: Trash2,
                            destructive: true,
                            separatorBefore: true,
                            onClick: () => setASupprimer(c),
                          },
                        ]}
                      />
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
        message={
          aSupprimer ? `« ${String(aSupprimer["nom"])} » sera définitivement supprimée.` : ""
        }
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
