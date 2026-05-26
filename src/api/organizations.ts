import api from "@/lib/axios";
import type {
  ApiResponse,
  Organization,
  CreateOrgRequest,
  UpdateOrgRequest,
  InviteMemberRequest,
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

  invite: (id: string, data: InviteMemberRequest) =>
    api.post<ApiResponse<null>>(`/organizations/${id}/invite`, data),
};
