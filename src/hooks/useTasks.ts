import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi } from "@/api/tasks";
import type { CreateTaskRequest, UpdateTaskRequest } from "@/types";

export const TASK_KEYS = {
  all: ["tasks"] as const,
  byProject: (projectId: string) => ["tasks", "project", projectId] as const,
  detail: (id: string) => ["tasks", id] as const,
};

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: projectId ? TASK_KEYS.byProject(projectId) : TASK_KEYS.all,
    queryFn: () => tasksApi.list(projectId).then((r) => r.data.data ?? []),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => tasksApi.get(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(vars.project_id) });
      toast.success("Task created!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to create task"),
  });
}

export function useUpdateTask(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTaskRequest) => tasksApi.update(id, data),
    onSuccess: (res) => {
      const task = res.data.data;
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      if (task)
        qc.invalidateQueries({
          queryKey: TASK_KEYS.byProject(task.project_id),
        });
      qc.invalidateQueries({ queryKey: TASK_KEYS.detail(id) });
      toast.success("Task updated!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to update"),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success("Task deleted");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to delete"),
  });
}

// ── Assign / Unassign ────────────────────────────────────────────────────────

export function useAssignTask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => tasksApi.assignUsers(taskId, userIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) });
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success("User(s) assigned!");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to assign"),
  });
}

export function useUnassignTask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => tasksApi.unassignUser(taskId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) });
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success("User unassigned");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error ?? "Failed to unassign"),
  });
}
