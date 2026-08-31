import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Archive,
  BookOpen,
  BookOpenCheck,
  DollarSign,
  Download,
  FilePen,
  Heart,
  TrendingUp,
} from "lucide-react";
import { editeurDashboardQuery } from "@/lib/dashboard/queries";
import type { DashboardEditeurPayload, PeriodeFiltre } from "@/lib/dashboard/types";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { KpiCard, SectionCard, SkeletonBlock } from "@/components/dashboard/ui";
import { AreaMetricChart, BarMetricChart } from "@/components/dashboard/charts";

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

const EDITEUR_KPIS = [
  {
    label: "Livres publiés",
    icon: BookOpen,
    iconClassName: "bg-brand-orange/20 text-brand-orange",
    valeur: (data: DashboardEditeurPayload) => data.publies,
  },
  {
    label: "Brouillons",
    icon: FilePen,
    iconClassName: "bg-amber-500/15 text-amber-700",
    valeur: (data: DashboardEditeurPayload) => data.brouillons,
  },
  {
    label: "Archivés",
    icon: Archive,
    iconClassName: "bg-slate-500/15 text-slate-600",
    valeur: (data: DashboardEditeurPayload) => data.archives,
  },
  {
    label: "Revenus",
    icon: DollarSign,
    iconClassName: "bg-emerald-500/15 text-emerald-700",
    valeur: (data: DashboardEditeurPayload) => `${fmt(Math.round(data.revenus))} $`,
  },
  {
    label: "Lectures",
    icon: BookOpenCheck,
    iconClassName: "bg-sky-500/15 text-sky-700",
    valeur: (data: DashboardEditeurPayload) => fmt(data.lectures),
  },
  {
    label: "Téléchargements",
    icon: Download,
    iconClassName: "bg-violet-500/15 text-violet-700",
    valeur: (data: DashboardEditeurPayload) => fmt(data.telechargements),
  },
  {
    label: "Favoris",
    icon: Heart,
    iconClassName: "bg-rose-500/15 text-rose-700",
    valeur: (data: DashboardEditeurPayload) => fmt(data.favoris),
  },
  {
    label: "Dernières ventes",
    icon: TrendingUp,
    iconClassName: "bg-brand-orange/15 text-brand-orange",
    valeur: (data: DashboardEditeurPayload) => data.dernieresVentes.length,
    hint: "sur la période",
  },
] as const;

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
        {EDITEUR_KPIS.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            valeur={kpi.valeur(data)}
            hint={"hint" in kpi ? kpi.hint : undefined}
            icon={kpi.icon}
            iconClassName={kpi.iconClassName}
          />
        ))}
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
            <Link to="/admin/edition/livres" className="text-xs text-accent hover:underline">
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
