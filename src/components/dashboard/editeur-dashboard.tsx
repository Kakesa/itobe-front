import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { editeurDashboardQuery } from "@/lib/dashboard/queries";
import type { PeriodeFiltre } from "@/lib/dashboard/types";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { KpiCard, SectionCard, SkeletonBlock } from "@/components/dashboard/ui";
import { AreaMetricChart, BarMetricChart } from "@/components/dashboard/charts";

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

export function EditeurDashboard() {
  const [periode, setPeriode] = useState<PeriodeFiltre>("annee");
  const { data, isLoading } = useQuery(editeurDashboardQuery(periode));

  if (isLoading || !data) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Maison d&apos;édition
          </p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Dashboard Éditeur</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivi de vos ouvrages, ventes et lectures
          </p>
        </div>
        <PeriodFilter value={periode} onChange={setPeriode} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Livres publiés" valeur={data.publies} />
        <KpiCard label="Brouillons" valeur={data.brouillons} />
        <KpiCard label="Archivés" valeur={data.archives} />
        <KpiCard label="Revenus" valeur={`${fmt(Math.round(data.revenus))} $`} />
        <KpiCard label="Lectures" valeur={fmt(data.lectures)} />
        <KpiCard label="Téléchargements" valeur={fmt(data.telechargements)} />
        <KpiCard label="Favoris" valeur={fmt(data.favoris)} />
        <KpiCard
          label="Dernières ventes"
          valeur={data.dernieresVentes.length}
          hint="sur la période"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AreaMetricChart titre="Revenus" data={data.series} dataKey="revenus" />
        <AreaMetricChart titre="Lectures" data={data.series} dataKey="lectures" />
        <BarMetricChart titre="Téléchargements" data={data.series} dataKey="telechargements" />
        <BarMetricChart titre="Évolution des ventes" data={data.series} dataKey="ventes" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          titre="Dernières ventes"
          action={
            <Link to="/admin/livres" className="text-xs text-accent hover:underline">
              Gérer les livres
            </Link>
          }
        >
          <ul className="divide-y divide-border text-sm">
            {data.dernieresVentes.map((v) => (
              <li key={v.id} className="flex justify-between gap-3 py-2.5">
                <div>
                  <p className="font-medium">{v.livre}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.client} · {v.date}
                  </p>
                </div>
                <p>{v.montant.toFixed(2)} $</p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard titre="Vos ouvrages">
          <ul className="space-y-3">
            {data.livres.map((l) => (
              <li key={l.slug} className="flex items-center gap-3 text-sm">
                <div className="size-9 rounded-md" style={{ backgroundImage: l.couleur }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{l.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.ventes} ventes · {fmt(l.lectures)} lectures · {fmt(l.telechargements)} DL
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{l.statut}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
