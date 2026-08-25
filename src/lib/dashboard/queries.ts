import { queryOptions } from "@tanstack/react-query";
import { DashboardService } from "./dashboard.service";
import type { PeriodeFiltre } from "./types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  admin: (periode: PeriodeFiltre) => [...dashboardKeys.all, "admin", periode] as const,
  editeur: (periode: PeriodeFiltre) => [...dashboardKeys.all, "editeur", periode] as const,
  lecteur: () => [...dashboardKeys.all, "lecteur"] as const,
};

export const adminDashboardQuery = (periode: PeriodeFiltre) =>
  queryOptions({
    queryKey: dashboardKeys.admin(periode),
    queryFn: () => DashboardService.getAdminDashboard(periode),
    staleTime: 60_000,
  });

export const editeurDashboardQuery = (periode: PeriodeFiltre) =>
  queryOptions({
    queryKey: dashboardKeys.editeur(periode),
    queryFn: () => DashboardService.getEditeurDashboard(periode),
    staleTime: 60_000,
  });

export const lecteurDashboardQuery = () =>
  queryOptions({
    queryKey: dashboardKeys.lecteur(),
    queryFn: () => DashboardService.getLecteurDashboard(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
