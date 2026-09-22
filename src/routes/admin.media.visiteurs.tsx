import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Users, Eye, Gauge } from "lucide-react";
import { AccesRestreint } from "@/components/admin-ui";
import { KpiCard, SectionCard, SkeletonBlock } from "@/components/dashboard/ui";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useRole } from "@/hooks/use-role";
import { DashboardApi } from "@/lib/api-client";

export const Route = createFileRoute("/admin/media/visiteurs")({
  component: VisiteursAdminPage,
});

type Period = "7j" | "30j" | "90j" | "annee";

const chartConfig: ChartConfig = {
  pageViews: { label: "Pages vues", color: "var(--accent)" },
  uniqueVisitors: { label: "Visiteurs uniques", color: "var(--ochre)" },
};

function VisiteursAdminPage() {
  const { role } = useRole();
  const [period, setPeriod] = useState<Period>("7j");
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard", "visitors", period],
    queryFn: () => DashboardApi.getVisitorStats(period),
    staleTime: 60_000,
  });

  if (role !== "admin") return <AccesRestreint requis={["admin"]} />;

  const stats = data?.data;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">Audience</p>
          <h1 className="mt-1 font-display text-3xl">Statistiques des visiteurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Suivez le trafic du site : pages vues et visiteurs uniques par période.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="visitor-period" className="text-sm text-muted-foreground">Par période</label>
          <select id="visitor-period" value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
            <option value="7j">7 derniers jours</option>
            <option value="30j">30 derniers jours</option>
            <option value="90j">90 derniers jours</option>
            <option value="annee">Cette année</option>
          </select>
          <button type="button" onClick={() => void refetch()} className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Actualiser
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="mt-8 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </div>
          <SkeletonBlock className="h-72" />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <KpiCard label="Pages vues" valeur={Number(stats?.pageViews ?? 0).toLocaleString("fr-FR")} hint="Sur la période" icon={Eye} />
            <KpiCard label="Visiteurs uniques" valeur={Number(stats?.uniqueVisitors ?? 0).toLocaleString("fr-FR")} hint="Visiteurs distincts" icon={Users} />
            <KpiCard label="Moyenne / période" valeur={Number(stats?.averagePageViews ?? 0).toLocaleString("fr-FR")} hint="Pages vues par jour" icon={Gauge} />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <SectionCard titre="Pages vues">
              <ChartContainer config={chartConfig} className="aspect-[16/9] w-full">
                <BarChart data={stats?.series ?? []}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="pageViews" fill="var(--color-pageViews)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </SectionCard>
            <SectionCard titre="Visiteurs uniques">
              <ChartContainer config={chartConfig} className="aspect-[16/9] w-full">
                <AreaChart data={stats?.series ?? []}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="uniqueVisitors" stroke="var(--color-uniqueVisitors)" fill="var(--color-uniqueVisitors)" fillOpacity={0.18} strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </SectionCard>
          </div>
          <SectionCard titre="Pages les plus visitées">
            <p className="mb-4 text-sm text-muted-foreground">Top 10 des pages consultées</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="pb-2 font-normal">Page</th><th className="pb-2 text-right font-normal">Visites</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {(stats?.topPages ?? []).map((page: { path: string; visits: number }) => (
                    <tr key={page.path}><td className="py-2.5 pr-3 font-mono text-xs">{page.path}</td><td className="py-2.5 text-right">{page.visits.toLocaleString("fr-FR")}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
