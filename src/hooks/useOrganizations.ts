import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orgsApi } from "@/api/organizations";
import type {
  CreateOrgRequest,
  UpdateOrgRequest,
  InviteMemberRequest,
} from "@/types";

export const ORG_KEYS = {
  all: ["organizations"] as const,
  detail: (id: string) => ["organizations", id] as const,
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

export function useInviteMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteMemberRequest) => orgsApi.invite(orgId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_KEYS.detail(orgId) });
      toast.success("Invitation sent!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to send invitation"),
  });
}
