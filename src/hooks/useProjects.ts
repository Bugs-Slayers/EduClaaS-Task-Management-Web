import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectsApi } from "@/api/projects";
import type { CreateProjectRequest, UpdateProjectRequest } from "@/types";

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  byOrg: (orgId: string) => ["projects", "org", orgId] as const,
  detail: (id: string) => ["projects", id] as const,
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
