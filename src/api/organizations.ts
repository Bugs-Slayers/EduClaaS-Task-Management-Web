import api from "@/lib/axios";
import type {
  ApiResponse,
  Organization,
  CreateOrgRequest,
  UpdateOrgRequest,
  SendOrgInvitationRequest,
  Invitation,
  OrgMemberEnriched,
  OrgRole,
} from "@/types";

export const orgsApi = {
  list: () => api.get<ApiResponse<Organization[]>>("/organizations"),

  get: (id: string) =>
    api.get<ApiResponse<Organization>>(`/organizations/${id}`),

  create: (data: CreateOrgRequest) =>
    api.post<ApiResponse<Organization>>("/organizations", data),

  update: (id: string, data: UpdateOrgRequest) =>
    api.put<ApiResponse<null>>(`/organizations/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/organizations/${id}`),

  // ── Invitations ──────────────────────────────────────────────────────────
  sendInvitation: (id: string, data: SendOrgInvitationRequest) =>
    api.post<ApiResponse<Invitation>>(`/organizations/${id}/invitations`, data),

  listInvitations: (id: string) =>
    api.get<ApiResponse<Invitation[]>>(`/organizations/${id}/invitations`),

  revokeInvitation: (id: string, invitationId: string) =>
    api.delete<ApiResponse<null>>(
      `/organizations/${id}/invitations/${invitationId}`,
    ),

  // ── Members ──────────────────────────────────────────────────────────────
  listMembers: (id: string) =>
    api.get<ApiResponse<OrgMemberEnriched[]>>(`/organizations/${id}/members`),

  updateMemberRole: (id: string, userId: string, role: OrgRole) =>
    api.put<ApiResponse<null>>(`/organizations/${id}/members/${userId}/role`, {
      role,
    }),

  removeMember: (id: string, userId: string) =>
    api.delete<ApiResponse<null>>(`/organizations/${id}/members/${userId}`),

  /** @deprecated use sendInvitation instead */
  invite: (id: string, data: SendOrgInvitationRequest) =>
    api.post<ApiResponse<null>>(`/organizations/${id}/invitations`, data),
};
