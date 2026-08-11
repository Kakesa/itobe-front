import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  MailCheck,
  MousePointerClick,
  Send,
  UserMinus,
  Users,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  BadgeCampagne,
  CarteStat,
  NewsletterEditor,
  NewsletterPreview,
} from "@/components/newsletter/newsletter-ui";
import { useCollection } from "@/lib/admin/store";
import { notify } from "@/lib/notify";
import {
  blocsDe,
  formatDateHeure,
  nombre,
  segmentParId,
  segments,
  statsDe,
  taux,
  type Bloc,
  type StatutCampagne,
} from "@/lib/newsletter/newsletter";

export const Route = createFileRoute("/admin/newsletter/campagne/$id")({
  component: CampagneDetail,
});

const champ =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const label = "mb-1.5 block text-xs font-medium text-muted-foreground";

function CampagneDetail() {
  const { id } = useParams({ from: "/admin/newsletter/campagne/$id" });
  const navigate = useNavigate();
  const { items, modifier } = useCollection("campagnes");
  const { items: abonnes } = useCollection("abonnes");
  const { items: templates } = useCollection("templates");
  const campagne = items.find((c) => c.id === id);

  const [onglet, setOnglet] = useState<"contenu" | "apercu" | "stats">("contenu");
  const [confirmEnvoi, setConfirmEnvoi] = useState(false);
  const [programmation, setProgrammation] = useState("");

  if (!campagne) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-display text-xl">Campagne introuvable</p>
        <Link to="/admin/newsletter/campagnes" className="mt-3 inline-block text-sm text-accent">
          Retour aux campagnes
        </Link>
      </div>
    );
  }

  const statut = String(campagne["statut"]) as StatutCampagne;
  const modifiable = statut === "DRAFT";
  const blocs = blocsDe(campagne["blocs"]);
  const seg = segmentParId(String(campagne["audience"]));
  const destinataires = abonnes.filter(seg.filtre).length;
  const s = statsDe(campagne);
  const journal = Array.isArray(campagne["journal"])
    ? (campagne["journal"] as { date: string; action: string }[])
    : [];

  const set = (patch: Record<string, unknown>) => modifier(campagne.id, patch);

  const journaliser = (action: string, patch: Record<string, unknown>) => {
    set({
      ...patch,
      journal: [...journal, { date: new Date().toISOString().slice(0, 16), action }],
    });
  };

  const envoyer = () => {
    if (statut === "SENT" || statut === "SENDING") {
      notify.attention("Cette campagne a déjà été envoyée");
      return;
    }
    if (!String(campagne["sujet"]).trim()) {
      notify.erreur("Renseignez l'objet de l'e-mail");
      return;
    }
    const maintenant = new Date().toISOString().slice(0, 16);
    const delivres = Math.round(destinataires * 0.97);
    journaliser("Envoi immédiat déclenché", {
      statut: "SENT",
      envoyee: maintenant,
      envoiPrevu: maintenant,
      destinataires,
      envoyes: destinataires,
      delivres,
      ouvertures: Math.round(delivres * 0.48),
      clics: Math.round(delivres * 0.13),
      desabonnements: Math.max(1, Math.round(delivres * 0.008)),
    });
    notify.succes("Campagne envoyée", { description: `${destinataires} destinataire(s)` });
    setConfirmEnvoi(false);
    setOnglet("stats");
  };

  const programmer = () => {
    if (!programmation) {
      notify.erreur("Choisissez une date et une heure d'envoi");
      return;
    }
    journaliser(`Programmée pour le ${formatDateHeure(programmation)}`, {
      statut: "SCHEDULED",
      envoiPrevu: programmation,
      destinataires,
    });
    notify.succes("Campagne programmée", { description: formatDateHeure(programmation) });
  };

  const etapes: { cle: string; label: string; actif: boolean; date: unknown }[] = [
    { cle: "creee", label: "Créée", actif: true, date: campagne["creee"] },
    {
      cle: "prog",
      label: "Programmée",
      actif: ["SCHEDULED", "SENDING", "SENT"].includes(statut),
      date: campagne["envoiPrevu"],
    },
    { cle: "envoi", label: "Envoi", actif: ["SENDING", "SENT"].includes(statut), date: campagne["envoiPrevu"] },
    { cle: "sent", label: "Envoyée", actif: statut === "SENT", date: campagne["envoyee"] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/admin/newsletter/campagnes"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
        >
          <ArrowLeft className="size-4" /> Campagnes
        </Link>
        <div className="min-w-0">
          <h2 className="truncate text-2xl">{String(campagne["nom"])}</h2>
          <p className="truncate text-sm text-muted-foreground">
            {String(campagne["sujet"] || "Objet à définir")}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <BadgeCampagne statut={statut} />
          {statut !== "SENT" && statut !== "SENDING" && (
            <button
              type="button"
              onClick={() => setConfirmEnvoi(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              <Send className="size-4" /> Envoyer maintenant
            </button>
          )}
          {statut === "SCHEDULED" && (
            <button
              type="button"
              onClick={() => journaliser("Programmation annulée", { statut: "CANCELLED", envoiPrevu: "" })}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              Annuler l&apos;envoi
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
        {(
          [
            ["contenu", "Réglages & contenu"],
            ["apercu", "Aperçu"],
            ["stats", "Statistiques"],
          ] as const
        ).map(([cle, texte]) => (
          <button
            key={cle}
            type="button"
            onClick={() => setOnglet(cle)}
            className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${
              onglet === cle
                ? "bg-primary font-medium text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {texte}
          </button>
        ))}
      </div>

      {onglet === "contenu" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-display text-lg">Réglages</h3>
            {[
              ["nom", "Nom interne"],
              ["sujet", "Sujet de l'e-mail"],
              ["expediteur", "Nom de l'expéditeur"],
              ["emailExpediteur", "E-mail de l'expéditeur"],
              ["repondreA", "Adresse de réponse"],
            ].map(([cle, texte]) => (
              <div key={cle}>
                <label htmlFor={`f-${cle}`} className={label}>
                  {texte}
                </label>
                <input
                  id={`f-${cle}`}
                  value={String(campagne[cle as string] ?? "")}
                  disabled={!modifiable}
                  onChange={(e) => set({ [cle as string]: e.target.value })}
                  className={`${champ} disabled:opacity-60`}
                />
              </div>
            ))}
            <div>
              <label htmlFor="f-aud" className={label}>
                Audience
              </label>
              <select
                id="f-aud"
                value={String(campagne["audience"])}
                disabled={!modifiable}
                onChange={(e) => set({ audience: e.target.value })}
                className={`${champ} disabled:opacity-60`}
              >
                {segments.map((sg) => (
                  <option key={sg.id} value={sg.id}>
                    {sg.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {seg.description} — {destinataires} destinataire(s).
              </p>
            </div>
            <div>
              <label htmlFor="f-tpl" className={label}>
                Template
              </label>
              <select
                id="f-tpl"
                value={String(campagne["template"] ?? "")}
                disabled={!modifiable}
                onChange={(e) => {
                  const tpl = templates.find((t) => t.id === e.target.value);
                  set({
                    template: e.target.value,
                    ...(tpl ? { blocs: blocsDe(tpl["blocs"]) } : {}),
                  });
                  if (tpl) notify.info("Template appliqué", { description: String(tpl["nom"]) });
                }}
                className={`${champ} disabled:opacity-60`}
              >
                <option value="">Aucun</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {String(t["nom"])}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-border pt-4">
              <label htmlFor="f-prog" className={label}>
                <CalendarClock className="mr-1 inline size-3.5" /> Programmer l&apos;envoi
              </label>
              <input
                id="f-prog"
                type="datetime-local"
                value={programmation || String(campagne["envoiPrevu"] ?? "")}
                onChange={(e) => setProgrammation(e.target.value)}
                disabled={statut === "SENT"}
                className={`${champ} disabled:opacity-60`}
              />
              <button
                type="button"
                onClick={programmer}
                disabled={statut === "SENT"}
                className="mt-3 w-full rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
              >
                Programmer la campagne
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                Une campagne programmée est exécutée automatiquement à l&apos;heure prévue et ne
                peut pas être envoyée deux fois.
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg">Contenu</h3>
              {!modifiable && (
                <p className="text-xs text-muted-foreground">
                  Contenu verrouillé : la campagne n&apos;est plus au statut brouillon.
                </p>
              )}
            </div>
            {modifiable ? (
              <NewsletterEditor
                blocs={blocs}
                onChange={(b: Bloc[]) => set({ blocs: b })}
              />
            ) : (
              <NewsletterPreview
                sujet={String(campagne["sujet"])}
                expediteur={String(campagne["expediteur"])}
                blocs={blocs}
              />
            )}
          </section>
        </div>
      )}

      {onglet === "apercu" && (
        <NewsletterPreview
          sujet={String(campagne["sujet"])}
          expediteur={String(campagne["expediteur"])}
          blocs={blocs}
        />
      )}

      {onglet === "stats" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <CarteStat label="Destinataires" valeur={nombre(s.destinataires)} icone={<Users className="size-4" />} />
            <CarteStat
              label="Délivrés"
              valeur={nombre(s.delivres)}
              hint={`Délivrabilité ${taux(s.delivres, s.envoyes)}`}
              icone={<MailCheck className="size-4" />}
            />
            <CarteStat
              label="Ouvertures"
              valeur={nombre(s.ouvertures)}
              hint={`Taux ${taux(s.ouvertures, s.delivres)}`}
              icone={<Send className="size-4" />}
            />
            <CarteStat
              label="Clics"
              valeur={nombre(s.clics)}
              hint={`Taux ${taux(s.clics, s.delivres)}`}
              icone={<MousePointerClick className="size-4" />}
            />
            <CarteStat
              label="Désabonnements"
              valeur={nombre(s.desabonnements)}
              icone={<UserMinus className="size-4" />}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Emails en erreur : {nombre(s.erreurs)} — audience « {seg.label} ».
          </p>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-display text-lg">Chronologie</h3>
          <ol className="space-y-4">
            {etapes.map((e) => (
              <li key={e.cle} className="flex gap-3">
                <span
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs ${
                    e.actif ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Check className="size-3.5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{e.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.actif ? formatDateHeure(e.date) : "En attente"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-display text-lg">Journal d&apos;audit</h3>
          {journal.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune opération enregistrée.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {[...journal].reverse().map((j, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-32 shrink-0 text-xs text-muted-foreground">
                    {formatDateHeure(j.date)}
                  </span>
                  <span>{j.action}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ConfirmDialog
        ouvert={confirmEnvoi}
        titre="Envoyer la campagne maintenant ?"
        message={`« ${String(campagne["nom"])} » sera envoyée à ${destinataires} abonné(s) du segment « ${seg.label} ». Cette action est définitive.`}
        onAnnuler={() => {
          setConfirmEnvoi(false);
          notify.annule("Envoi annulé");
        }}
        onConfirmer={envoyer}
      />

      <button
        type="button"
        onClick={() => void navigate({ to: "/admin/newsletter/campagnes" })}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ← Retour à l&apos;historique des campagnes
      </button>
    </div>
  );
}
