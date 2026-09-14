import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Archive,
  BookOpen,
  CircleCheck,
  ClipboardList,
  CreditCard,
  DollarSign,
  Download,
  FilePen,
  Heart,
  Monitor,
  Package,
  Percent,
  TrendingUp,
  BookOpenCheck,
} from "lucide-react";
import { adminDashboardQuery } from "@/lib/dashboard/queries";
import type { PeriodeFiltre, VueEnsemble } from "@/lib/dashboard/types";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { KpiCard, SectionCard, SkeletonBlock } from "@/components/dashboard/ui";
import { AreaMetricChart, BarMetricChart, PieMetricChart } from "@/components/dashboard/charts";
import { Statut } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";
import { EditeurDashboard } from "@/components/dashboard/editeur-dashboard";

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

function money(n: number) {
  return `${fmt(Math.round(n))} $`;
}

const EDITION_KPIS = [
  {
    label: "Livres",
    icon: BookOpen,
    iconClassName: "bg-brand-gold/20 text-brand-brown",
    valeur: (vue: VueEnsemble) => vue.edition.livres,
  },
  {
    label: "Publiés",
    icon: CircleCheck,
    iconClassName: "bg-emerald-500/15 text-emerald-700",
    valeur: (vue: VueEnsemble) => vue.edition.publies,
  },
  {
    label: "Numériques",
    icon: Monitor,
    iconClassName: "bg-sky-500/15 text-sky-700",
    valeur: (vue: VueEnsemble) => vue.edition.numeriques,
  },
  {
    label: "Physiques",
    icon: Package,
    iconClassName: "bg-amber-500/15 text-amber-700",
    valeur: (vue: VueEnsemble) => vue.edition.physiques,
  },
  {
    label: "Revenus ce mois",
    icon: DollarSign,
    iconClassName: "bg-brand-gold/15 text-brand-brown",
    valeur: (vue: VueEnsemble) => money(vue.paiements.revenusMois),
  },
  {
    label: "Commandes",
    icon: ClipboardList,
    iconClassName: "bg-violet-500/15 text-violet-700",
    valeur: (vue: VueEnsemble) => vue.paiements.commandes,
  },
  {
    label: "En promotion",
    icon: Percent,
    iconClassName: "bg-rose-500/15 text-rose-700",
    valeur: (vue: VueEnsemble) => vue.edition.promotions,
  },
  {
    label: "Paiements",
    icon: CreditCard,
    iconClassName: "bg-indigo-500/15 text-indigo-700",
    valeur: (vue: VueEnsemble) => `${vue.paiements.reussis} OK`,
    hint: (vue: VueEnsemble) => `${vue.paiements.echoues} échoué(s)`,
  },
] as const;

function EditionAdminFullDashboard() {
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
      </div>
    );
  }

  const { vue } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-gold">
            Maison d&apos;édition
          </p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Dashboard Édition</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catalogue, ventes, revenus et promotions
          </p>
        </div>
        <PeriodFilter value={periode} onChange={setPeriode} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EDITION_KPIS.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            valeur={kpi.valeur(vue)}
            hint={"hint" in kpi ? kpi.hint(vue) : undefined}
            icon={kpi.icon}
            iconClassName={kpi.iconClassName}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AreaMetricChart titre="Revenus" data={data.series} dataKey="revenus" />
        <BarMetricChart titre="Ventes" data={data.series} dataKey="ventes" />
        <PieMetricChart titre="Ventes par format" data={data.repartitionFormats} />
        <PieMetricChart titre="Livres par catégorie" data={data.repartitionCategories} />
      </div>

      <SectionCard
        titre="Dernières commandes"
        action={
          <Link to="/admin/edition/commandes" className="text-xs text-brand-brown hover:underline">
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
                <th className="pb-2 font-normal">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.commandes.slice(0, 6).map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5 pr-3">{c.client}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{c.livre}</td>
                  <td className="py-2.5 pr-3">{c.prix.toFixed(2)} $</td>
                  <td className="py-2.5">
                    <Statut valeur={c.statut} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/edition/livres"
          className="rounded-sm bg-brand-gold px-4 py-2.5 text-sm font-medium text-brand-brown hover:opacity-90"
        >
          Gérer le catalogue
        </Link>
        <Link
          to="/admin/edition/commandes"
          className="rounded-sm border border-border px-4 py-2.5 text-sm hover:bg-secondary"
        >
          Commandes
        </Link>
        <Link
          to="/admin/media"
          className="rounded-sm border border-brand-blue/30 px-4 py-2.5 text-sm text-brand-blue hover:bg-brand-blue/5"
        >
          Espace Média
        </Link>
      </div>
    </div>
  );
}

export function EditionAdminDashboard() {
  const { role } = useRole();
  if (role === "editeur") return <EditeurDashboard />;
  return <EditionAdminFullDashboard />;
}
