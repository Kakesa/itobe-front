import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CircleCheck,
  Eye,
  FilePen,
  FolderOpen,
  MessageSquare,
  Newspaper,
  Timer,
  Users,
} from "lucide-react";
import { adminDashboardQuery } from "@/lib/dashboard/queries";
import type { PeriodeFiltre, VueEnsemble } from "@/lib/dashboard/types";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { KpiCard, SectionCard, SkeletonBlock } from "@/components/dashboard/ui";
import { AreaMetricChart, BarMetricChart } from "@/components/dashboard/charts";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { Statut } from "@/components/admin-ui";

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

const MEDIA_KPIS = [
  {
    label: "Articles",
    key: "articles" as const,
    icon: Newspaper,
    iconClassName: "bg-brand-blue/20 text-brand-blue",
  },
  {
    label: "Publiés",
    key: "publies" as const,
    icon: CircleCheck,
    iconClassName: "bg-emerald-500/15 text-emerald-700",
  },
  {
    label: "Brouillons",
    key: "brouillons" as const,
    icon: FilePen,
    iconClassName: "bg-amber-500/15 text-amber-700",
  },
  {
    label: "Programmés",
    key: "programmes" as const,
    icon: CalendarClock,
    iconClassName: "bg-violet-500/15 text-violet-700",
  },
  {
    label: "Catégories",
    key: "categories" as const,
    icon: FolderOpen,
    iconClassName: "bg-brand-blue/15 text-brand-blue",
  },
  {
    label: "Commentaires",
    key: "commentaires" as const,
    icon: MessageSquare,
    iconClassName: "bg-sky-500/15 text-sky-700",
  },
  {
    label: "Vues",
    key: "vues" as const,
    icon: Eye,
    iconClassName: "bg-indigo-500/15 text-indigo-700",
  },
  {
    label: "Visiteurs",
    key: "visiteurs" as const,
    icon: Users,
    iconClassName: "bg-teal-500/15 text-teal-700",
  },
  {
    label: "Temps lecture moyen",
    key: "tempsLectureMoyen" as const,
    icon: Timer,
    iconClassName: "bg-brand-blue/10 text-brand-blue",
  },
] as const;

function valeurKpiMedia(key: (typeof MEDIA_KPIS)[number]["key"], media: VueEnsemble["media"]) {
  if (key === "vues" || key === "visiteurs") return fmt(media[key]);
  return media[key];
}

export function MediaAdminDashboard() {
  const [periode, setPeriode] = useState<PeriodeFiltre>("annee");
  const { data, isLoading } = useQuery(adminDashboardQuery(periode));

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-10 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
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
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">
            Portail Média
          </p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Dashboard Média</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Articles, actualités, audience et newsletter
          </p>
        </div>
        <PeriodFilter value={periode} onChange={setPeriode} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MEDIA_KPIS.map((kpi) => (
          <KpiCard
            key={kpi.key}
            label={kpi.label}
            valeur={valeurKpiMedia(kpi.key, vue.media)}
            icon={kpi.icon}
            iconClassName={kpi.iconClassName}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarMetricChart titre="Articles publiés" data={data.series} dataKey="articles" />
        <AreaMetricChart titre="Abonnés Newsletter" data={data.series} dataKey="newsletter" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityTimeline items={data.activites} />
        <AlertsPanel items={data.alertes.slice(0, 5)} />
      </div>

      <SectionCard
        titre="Derniers articles"
        action={
          <Link to="/admin/media/articles" className="text-xs text-brand-blue hover:underline">
            Gérer les articles
          </Link>
        }
      >
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

      <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/media/articles"
          className="rounded-sm bg-brand-blue px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Nouvel article
        </Link>
        <Link
          to="/admin/media/newsletter"
          className="rounded-sm border border-border px-4 py-2.5 text-sm hover:bg-secondary"
        >
          Newsletter
        </Link>
      </div>
    </div>
  );
}
