import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectsApi } from "@/api/projects";
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  SendProjectInvitationRequest,
} from "@/types";

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  byOrg: (orgId: string) => ["projects", "org", orgId] as const,
  detail: (id: string) => ["projects", id] as const,
  members: (id: string) => ["projects", id, "members"] as const,
  invitations: (id: string) => ["projects", id, "invitations"] as const,
};

export function useProjects(organizationId?: string) {
  return useQuery({
    queryKey: organizationId
      ? PROJECT_KEYS.byOrg(organizationId)
      : PROJECT_KEYS.all,
    queryFn: () =>
      projectsApi.list(organizationId).then((r) => r.data.data ?? []),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectsApi.get(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.create(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      qc.invalidateQueries({
        queryKey: PROJECT_KEYS.byOrg(vars.organization_id),
      });
      toast.success("Project created!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to create project"),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectRequest) => projectsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
      toast.success("Project updated!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to update"),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      toast.success("Project deleted");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to delete"),
  });
}

// ── Invitations ──────────────────────────────────────────────────────────────

export function useProjectInvitations(projectId: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.invitations(projectId),
    queryFn: () =>
      projectsApi.listInvitations(projectId).then((r) => r.data.data ?? []),
    enabled: !!projectId,
  });
}

export function useSendProjectInvitation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SendProjectInvitationRequest) =>
      projectsApi.sendInvitation(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.invitations(projectId) });
      toast.success("Invitation sent!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to send invitation"),
  });
}

export function useRevokeProjectInvitation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      projectsApi.revokeInvitation(projectId, invitationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.invitations(projectId) });
      toast.success("Invitation revoked");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to revoke invitation"),
  });
}

// ── Members ──────────────────────────────────────────────────────────────────

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.members(projectId),
    queryFn: () =>
      projectsApi.listMembers(projectId).then((r) => r.data.data ?? []),
    enabled: !!projectId,
  });
}

export function useRemoveProjectMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.members(projectId) });
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      toast.success("Member removed");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to remove member"),
  });
}
