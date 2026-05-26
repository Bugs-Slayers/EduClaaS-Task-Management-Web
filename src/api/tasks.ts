import api from "@/lib/axios";
import type {
  ApiResponse,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/types";

export const tasksApi = {
  list: (projectId?: string) =>
    api.get<ApiResponse<Task[]>>("/tasks", {
      params: projectId ? { project_id: projectId } : undefined,
    }),

  get: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),

  create: (data: CreateTaskRequest) =>
    api.post<ApiResponse<Task>>("/tasks", data),

  update: (id: string, data: UpdateTaskRequest) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/tasks/${id}`),

  // ── Assign / Unassign ────────────────────────────────────────────────────
  assignUsers: (id: string, userIds: string[]) =>
    api.post<ApiResponse<Task>>(`/tasks/${id}/assign`, { user_ids: userIds }),

  unassignUser: (id: string, userId: string) =>
    api.delete<ApiResponse<Task>>(`/tasks/${id}/assign/${userId}`),
};
