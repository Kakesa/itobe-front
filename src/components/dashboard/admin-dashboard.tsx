import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { adminDashboardQuery } from "@/lib/dashboard/queries";
import type { PeriodeFiltre } from "@/lib/dashboard/types";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { KpiCard, SectionCard, SkeletonBlock } from "@/components/dashboard/ui";
import {
  AreaMetricChart,
  BarMetricChart,
  PieMetricChart,
} from "@/components/dashboard/charts";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Statut } from "@/components/admin-ui";

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

function money(n: number) {
  return `${fmt(Math.round(n))} $`;
}

export function AdminDashboard() {
  const [periode, setPeriode] = useState<PeriodeFiltre>("annee");
  const { data, isLoading } = useQuery(adminDashboardQuery(periode));

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-10 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24" />
          ))}
        </div>
        <SkeletonBlock className="h-64" />
      </div>
    );
  }

  const { vue } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Back-office
          </p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue globale Média + Maison d&apos;édition
          </p>
        </div>
        <PeriodFilter value={periode} onChange={setPeriode} />
      </div>

      {/* Section 1 — Vue d'ensemble */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Média
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Articles" valeur={vue.media.articles} />
          <KpiCard label="Publiés" valeur={vue.media.publies} />
          <KpiCard label="Brouillons" valeur={vue.media.brouillons} />
          <KpiCard label="Programmés" valeur={vue.media.programmes} />
          <KpiCard label="Catégories" valeur={vue.media.categories} />
          <KpiCard label="Commentaires" valeur={vue.media.commentaires} />
          <KpiCard label="Vues" valeur={fmt(vue.media.vues)} />
          <KpiCard label="Temps lecture moyen" valeur={vue.media.tempsLectureMoyen} />
        </div>

        <h2 className="pt-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Maison d&apos;édition
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Livres" valeur={vue.edition.livres} />
          <KpiCard label="Publiés" valeur={vue.edition.publies} />
          <KpiCard label="Numériques" valeur={vue.edition.numeriques} />
          <KpiCard label="Physiques" valeur={vue.edition.physiques} />
          <KpiCard label="Brouillons" valeur={vue.edition.brouillons} />
          <KpiCard label="Archivés" valeur={vue.edition.archives} />
          <KpiCard label="En promotion" valeur={vue.edition.promotions} />
        </div>

        <h2 className="pt-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Utilisateurs & paiements
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Utilisateurs" valeur={fmt(vue.utilisateurs.total)} hint={`+${vue.utilisateurs.nouveaux} nouveaux`} />
          <KpiCard label="Lecteurs" valeur={fmt(vue.utilisateurs.lecteurs)} />
          <KpiCard label="Éditeurs" valeur={vue.utilisateurs.editeurs} />
          <KpiCard label="Revenus aujourd'hui" valeur={money(vue.paiements.revenusAujourdhui)} />
          <KpiCard label="Revenus ce mois" valeur={money(vue.paiements.revenusMois)} />
          <KpiCard label="Revenus totaux" valeur={money(vue.paiements.revenusTotaux)} />
          <KpiCard label="Commandes" valeur={vue.paiements.commandes} />
          <KpiCard
            label="Paiements"
            valeur={`${vue.paiements.reussis} OK`}
            hint={`${vue.paiements.echoues} échoué(s)`}
          />
        </div>
      </div>

      {/* Section 2 — Graphiques */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AreaMetricChart titre="Évolution des revenus" data={data.series} dataKey="revenus" />
        <BarMetricChart titre="Évolution des ventes" data={data.series} dataKey="ventes" />
        <AreaMetricChart titre="Évolution des utilisateurs" data={data.series} dataKey="utilisateurs" />
        <AreaMetricChart titre="Évolution des lectures" data={data.series} dataKey="lectures" />
        <BarMetricChart titre="Téléchargements" data={data.series} dataKey="telechargements" />
        <BarMetricChart titre="Articles publiés" data={data.series} dataKey="articles" />
        <BarMetricChart titre="Livres publiés" data={data.series} dataKey="livres" />
        <AreaMetricChart titre="Abonnés Newsletter" data={data.series} dataKey="newsletter" />
        <PieMetricChart titre="Ventes par format" data={data.repartitionFormats} />
        <PieMetricChart titre="Livres par catégorie" data={data.repartitionCategories} />
      </div>

      {/* Sections 3 + 10 + 11 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ActivityTimeline items={data.activites} />
        <AlertsPanel items={data.alertes} />
        <QuickActions />
      </div>

      {/* Section 4 — Commandes */}
      <SectionCard
        titre="Dernières commandes"
        action={
          <Link to="/admin/commandes" className="text-xs text-accent hover:underline">
            Tout voir
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-2 font-normal">Client</th>
                <th className="pb-2 font-normal">Livre</th>
                <th className="pb-2 font-normal">Prix</th>
                <th className="pb-2 font-normal">Paiement</th>
                <th className="pb-2 font-normal">Date</th>
                <th className="pb-2 font-normal">Statut</th>
                <th className="pb-2 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.commandes.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5 pr-3">{c.client}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{c.livre}</td>
                  <td className="py-2.5 pr-3">{c.prix.toFixed(2)} $</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{c.paiement}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{c.date}</td>
                  <td className="py-2.5 pr-3">
                    <Statut valeur={c.statut} />
                  </td>
                  <td className="py-2.5 text-right">
                    <Link to="/admin/commandes" className="text-xs text-accent hover:underline">
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Sections 5 + 6 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard titre="Derniers livres">
          <ul className="space-y-3">
            {data.derniersLivres.map((l) => (
              <li key={l.slug} className="flex items-center gap-3">
                <div className="size-10 shrink-0 rounded-md" style={{ backgroundImage: l.couleur }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.auteur} · {l.prix.toFixed(2)} $
                  </p>
                </div>
                <div className="text-right text-[0.65rem] text-muted-foreground">
                  <p>{l.ventes} ventes</p>
                  <p>{fmt(l.lectures)} lectures</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard titre="Derniers articles">
          <ul className="space-y-3">
            {data.derniersArticles.map((a) => (
              <li key={a.slug} className="flex items-center gap-3">
                <div className="size-10 shrink-0 rounded-md" style={{ backgroundImage: a.image }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.categorie} · {a.auteur}
                  </p>
                </div>
                <div className="text-right text-[0.65rem] text-muted-foreground">
                  <Statut valeur={a.statut} />
                  <p className="mt-1">{fmt(a.vues)} vues</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Sections 7 + 8 + 9 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard titre="Top ventes">
          <ol className="space-y-3">
            {data.topVentes.slice(0, 10).map((l, i) => (
              <li key={l.slug} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-xs text-muted-foreground">{i + 1}</span>
                <div className="size-8 rounded" style={{ backgroundImage: l.couleur }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{l.titre}</p>
                  <p className="text-xs text-muted-foreground">{l.auteur}</p>
                </div>
                <div className="text-right text-xs">
                  <p>{l.ventes}</p>
                  <p className="text-muted-foreground">{money(l.revenus)}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard titre="Articles populaires">
          <ul className="space-y-3">
            {data.articlesPopulaires.map((a) => (
              <li key={a.slug} className="flex gap-3 text-sm">
                <div className="size-10 shrink-0 rounded-md" style={{ backgroundImage: a.image }} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt(a.vues)} vues · {a.tempsLecture} · {a.commentaires} com.
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard titre="Auteurs populaires">
          <ul className="space-y-3">
            {data.auteursPopulaires.map((a) => (
              <li key={a.slug} className="flex items-center gap-3 text-sm">
                <div className="grid size-10 place-items-center rounded-full bg-secondary font-display text-sm">
                  {a.nom.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.nom}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.livres} livres · {money(a.revenus)}
                  </p>
                </div>
                <div className="text-right text-[0.65rem] text-muted-foreground">
                  <p>{fmt(a.lectures)} lectures</p>
                  <p>{fmt(a.telechargements)} DL</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
