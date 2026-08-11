import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarClock, MailCheck, MousePointerClick, Send, UserMinus, Users } from "lucide-react";
import { BadgeCampagne, CarteStat } from "@/components/newsletter/newsletter-ui";
import { useCollection } from "@/lib/admin/store";
import {
  formatDateHeure,
  nombre,
  segments,
  statsDe,
  tailleSegment,
  taux,
} from "@/lib/newsletter/newsletter";

export const Route = createFileRoute("/admin/newsletter/")({
  component: NewsletterDashboard,
});

function NewsletterDashboard() {
  const { items: campagnes } = useCollection("campagnes");
  const { items: abonnes } = useCollection("abonnes");

  const cumul = useMemo(() => {
    return campagnes
      .filter((c) => c["statut"] === "SENT")
      .reduce(
        (acc, c) => {
          const s = statsDe(c);
          return {
            envoyes: acc.envoyes + s.envoyes,
            delivres: acc.delivres + s.delivres,
            ouvertures: acc.ouvertures + s.ouvertures,
            clics: acc.clics + s.clics,
            desabonnements: acc.desabonnements + s.desabonnements,
          };
        },
        { envoyes: 0, delivres: 0, ouvertures: 0, clics: 0, desabonnements: 0 },
      );
  }, [campagnes]);

  const actifs = abonnes.filter((a) => a["statut"] === "ACTIVE").length;
  const programmees = campagnes.filter((c) => c["statut"] === "SCHEDULED");
  const recentes = [...campagnes]
    .sort((a, b) => String(b["creee"]).localeCompare(String(a["creee"])))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <CarteStat label="Emails envoyés" valeur={nombre(cumul.envoyes)} icone={<Send className="size-4" />} />
        <CarteStat
          label="Délivrés"
          valeur={nombre(cumul.delivres)}
          hint={`Délivrabilité ${taux(cumul.delivres, cumul.envoyes)}`}
          icone={<MailCheck className="size-4" />}
        />
        <CarteStat
          label="Ouvertures"
          valeur={nombre(cumul.ouvertures)}
          hint={`Taux ${taux(cumul.ouvertures, cumul.delivres)}`}
          icone={<Users className="size-4" />}
        />
        <CarteStat
          label="Clics"
          valeur={nombre(cumul.clics)}
          hint={`Taux ${taux(cumul.clics, cumul.delivres)}`}
          icone={<MousePointerClick className="size-4" />}
        />
        <CarteStat
          label="Désabonnements"
          valeur={nombre(cumul.desabonnements)}
          icone={<UserMinus className="size-4" />}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg">Dernières campagnes</h2>
            <Link to="/admin/newsletter/campagnes" className="text-xs text-accent hover:underline">
              Tout voir
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentes.map((c) => {
              const s = statsDe(c);
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/admin/newsletter/campagne/$id"
                      params={{ id: c.id }}
                      className="truncate font-medium hover:text-accent"
                    >
                      {String(c["nom"])}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{String(c["sujet"])}</p>
                  </div>
                  <BadgeCampagne statut={String(c["statut"])} />
                  <p className="w-24 text-right text-xs text-muted-foreground">
                    {s.delivres > 0 ? `${taux(s.ouvertures, s.delivres)} ouv.` : "—"}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 font-display text-lg">Base d&apos;abonnés</h2>
            <p className="font-display text-3xl">{nombre(actifs)}</p>
            <p className="text-xs text-muted-foreground">abonnés actifs sur {abonnes.length}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {segments.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium">{tailleSegment(abonnes, s.id)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg">
              <CalendarClock className="size-4 text-ochre" /> Envois programmés
            </h2>
            {programmees.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune campagne programmée.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {programmees.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/admin/newsletter/campagne/$id"
                      params={{ id: c.id }}
                      className="font-medium hover:text-accent"
                    >
                      {String(c["nom"])}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDateHeure(c["envoiPrevu"])}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
