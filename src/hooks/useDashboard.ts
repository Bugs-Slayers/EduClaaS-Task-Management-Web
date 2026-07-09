import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard";

export const DASHBOARD_KEYS = {
  stats: ["dashboard", "stats"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.stats,
    queryFn: () => dashboardApi.stats().then((r) => r.data.data!),
  });
}
