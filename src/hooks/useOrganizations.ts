import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orgsApi } from "@/api/organizations";
import type {
  CreateOrgRequest,
  UpdateOrgRequest,
  SendOrgInvitationRequest,
  OrgRole,
} from "@/types";

export const ORG_KEYS = {
  all: ["organizations"] as const,
  detail: (id: string) => ["organizations", id] as const,
  members: (id: string) => ["organizations", id, "members"] as const,
  invitations: (id: string) => ["organizations", id, "invitations"] as const,
};

export function useOrganizations() {
  return useQuery({
    queryKey: ORG_KEYS.all,
    queryFn: () => orgsApi.list().then((r) => r.data.data ?? []),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: ORG_KEYS.detail(id),
    queryFn: () => orgsApi.get(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrgRequest) => orgsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.all });
      toast.success("Organization created!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to create organization"),
  });
}

export function useUpdateOrganization(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrgRequest) => orgsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.all });
      qc.invalidateQueries({ queryKey: ORG_KEYS.detail(id) });
      toast.success("Organization updated!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to update"),
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orgsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.all });
      toast.success("Organization deleted");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to delete"),
  });
}

// ── Invitations ──────────────────────────────────────────────────────────────

export function useOrgInvitations(orgId: string) {
  return useQuery({
    queryKey: ORG_KEYS.invitations(orgId),
    queryFn: () =>
      orgsApi.listInvitations(orgId).then((r) => r.data.data ?? []),
    enabled: !!orgId,
  });
}

export function useSendOrgInvitation(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SendOrgInvitationRequest) =>
      orgsApi.sendInvitation(orgId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.invitations(orgId) });
      toast.success("Invitation sent!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to send invitation"),
  });
}

export function useRevokeOrgInvitation(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      orgsApi.revokeInvitation(orgId, invitationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.invitations(orgId) });
      toast.success("Invitation revoked");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to revoke invitation"),
  });
}

// ── Members ──────────────────────────────────────────────────────────────────

export function useOrgMembers(orgId: string) {
  return useQuery({
    queryKey: ORG_KEYS.members(orgId),
    queryFn: () => orgsApi.listMembers(orgId).then((r) => r.data.data ?? []),
    enabled: !!orgId,
  });
}

export function useUpdateOrgMemberRole(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: OrgRole }) =>
      orgsApi.updateMemberRole(orgId, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.members(orgId) });
      toast.success("Role updated!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to update role"),
  });
}

export function useRemoveOrgMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => orgsApi.removeMember(orgId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.members(orgId) });
      qc.invalidateQueries({ queryKey: ORG_KEYS.detail(orgId) });
      toast.success("Member removed");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to remove member"),
  });
}

/** @deprecated use useSendOrgInvitation */
export function useInviteMember(orgId: string) {
  return useSendOrgInvitation(orgId);
}
