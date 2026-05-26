import api from "@/lib/axios";
import type {
  ApiResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types";

export const projectsApi = {
  list: (organizationId?: string) =>
    api.get<ApiResponse<Project[]>>("/projects", {
      params: organizationId ? { organization_id: organizationId } : undefined,
    }),

  get: (id: string) => api.get<ApiResponse<Project>>(`/projects/${id}`),

  create: (data: CreateProjectRequest) =>
    api.post<ApiResponse<Project>>("/projects", data),

  update: (id: string, data: UpdateProjectRequest) =>
    api.put<ApiResponse<null>>(`/projects/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/projects/${id}`),

  addMember: (id: string, userId: string) =>
    api.post<ApiResponse<null>>(`/projects/${id}/members`, { user_id: userId }),
};
