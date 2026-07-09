import api from "@/lib/axios";
import type { ApiResponse, DashboardStats } from "@/types";

export const dashboardApi = {
  stats: () =>
    api.get<ApiResponse<DashboardStats>>("/dashboard/stats"),
};
