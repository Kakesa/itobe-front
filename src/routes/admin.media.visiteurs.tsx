import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { AccesRestreint, BarreOutils } from "@/components/admin-ui";
import { KpiCard, SkeletonBlock } from "@/components/dashboard/ui";
import { useRole } from "@/hooks/use-role";
import { DashboardApi } from "@/lib/api-client";

export const Route = createFileRoute("/admin/media/visiteurs")({
  component: VisiteursAdminPage,
});

function VisiteursAdminPage() {
  const { role } = useRole();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard", "visitors"],
    queryFn: () => DashboardApi.getVisitorStats(),
    staleTime: 60_000,
  });

  if (role !== "admin") return <AccesRestreint requis={["admin"]} />;

  const stats = data?.data;

  return (
    <div>
      <BarreOutils titre="Visiteurs" action="Actualiser" onAction={() => void refetch()} />
      <p className="mt-2 text-sm text-muted-foreground">
        Nombre de visiteurs uniques enregistrés sur le site public.
      </p>
      {isLoading ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <KpiCard label="Visiteurs uniques" valeur={Number(stats?.visiteurs ?? 0).toLocaleString("fr-FR")} icon={Users} />
          <KpiCard label="Visiteurs aujourd'hui" valeur={Number(stats?.today ?? 0).toLocaleString("fr-FR")} icon={Users} />
        </div>
      )}
    </div>
  );
}
