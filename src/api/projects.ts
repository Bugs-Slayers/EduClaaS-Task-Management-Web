import api from "@/lib/axios";
import type {
  ApiResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  SendProjectInvitationRequest,
  Invitation,
  ProjectMember,
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

  // ── Invitations ──────────────────────────────────────────────────────────
  sendInvitation: (id: string, data: SendProjectInvitationRequest) =>
    api.post<ApiResponse<Invitation>>(`/projects/${id}/invitations`, data),

  listInvitations: (id: string) =>
    api.get<ApiResponse<Invitation[]>>(`/projects/${id}/invitations`),

  revokeInvitation: (id: string, invitationId: string) =>
    api.delete<ApiResponse<null>>(
      `/projects/${id}/invitations/${invitationId}`,
    ),

  // ── Members ──────────────────────────────────────────────────────────────
  listMembers: (id: string) =>
    api.get<ApiResponse<ProjectMember[]>>(`/projects/${id}/members`),

  removeMember: (id: string, userId: string) =>
    api.delete<ApiResponse<null>>(`/projects/${id}/members/${userId}`),

  /** @deprecated use sendInvitation instead */
  addMember: (id: string, userId: string) =>
    api.post<ApiResponse<null>>(`/projects/${id}/members`, { user_id: userId }),
};
