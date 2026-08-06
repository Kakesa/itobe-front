import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { SectionCard } from "./ui";
import type { PointSerie } from "@/lib/dashboard/types";

const config: ChartConfig = {
  revenus: { label: "Revenus", color: "var(--accent)" },
  ventes: { label: "Ventes", color: "var(--ochre)" },
  utilisateurs: { label: "Utilisateurs", color: "var(--chart-3)" },
  lectures: { label: "Lectures", color: "var(--terracotta)" },
  telechargements: { label: "Téléchargements", color: "var(--chart-5)" },
  articles: { label: "Articles", color: "var(--accent)" },
  livres: { label: "Livres", color: "var(--ochre)" },
  newsletter: { label: "Newsletter", color: "var(--chart-3)" },
  valeur: { label: "Valeur", color: "var(--accent)" },
};

const PIE_COLORS = [
  "var(--accent)",
  "var(--ochre)",
  "var(--terracotta)",
  "var(--chart-3)",
  "var(--chart-5)",
];

export function AreaMetricChart({
  titre,
  data,
  dataKey,
}: {
  titre: string;
  data: PointSerie[];
  dataKey: keyof PointSerie;
}) {
  return (
    <SectionCard titre={titre}>
      <ChartContainer config={config} className="aspect-[16/9] w-full">
        <AreaChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} fontSize={11} width={36} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey={dataKey as string}
            stroke={`var(--color-${String(dataKey)})`}
            fill={`var(--color-${String(dataKey)})`}
            fillOpacity={0.18}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </SectionCard>
  );
}

export function BarMetricChart({
  titre,
  data,
  dataKey,
}: {
  titre: string;
  data: PointSerie[];
  dataKey: keyof PointSerie;
}) {
  return (
    <SectionCard titre={titre}>
      <ChartContainer config={config} className="aspect-[16/9] w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} fontSize={11} width={36} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey={dataKey as string}
            fill={`var(--color-${String(dataKey)})`}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </SectionCard>
  );
}

export function PieMetricChart({
  titre,
  data,
}: {
  titre: string;
  data: { nom: string; valeur: number }[];
}) {
  return (
    <SectionCard titre={titre}>
      <ChartContainer config={config} className="mx-auto aspect-square max-h-[260px]">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="nom" />} />
          <Pie data={data} dataKey="valeur" nameKey="nom" innerRadius={55} outerRadius={90}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
        {data.map((d, i) => (
          <li key={d.nom} className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            {d.nom} ({d.valeur})
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
