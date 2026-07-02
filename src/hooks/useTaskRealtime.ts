import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { TASK_KEYS } from "@/hooks/useTasks";
import type { Task, TaskRealtimeEvent, TaskStatus } from "@/types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  blocked: "Blocked",
};

interface UseTaskRealtimeOptions {
  projectId?: string;
  tasks?: Task[];
}

function taskMatchesUser(task: Task, userId?: string) {
  return !!userId && task.assigned_to.includes(userId);
}

function removeTask(tasks: Task[] | undefined, taskId: string) {
  return tasks?.filter((task) => task.id !== taskId) ?? tasks;
}

function upsertTask(tasks: Task[] | undefined, task: Task) {
  if (!tasks) return tasks;
  const exists = tasks.some((item) => item.id === task.id);
  if (!exists) return [task, ...tasks];
  return tasks.map((item) => (item.id === task.id ? task : item));
}

function findCachedTask(queryClient: ReturnType<typeof useQueryClient>, event: TaskRealtimeEvent) {
  return (
    queryClient.getQueryData<Task>(TASK_KEYS.detail(event.payload.id)) ??
    queryClient
      .getQueryData<Task[]>(TASK_KEYS.byProject(event.project_id))
      ?.find((task) => task.id === event.payload.id) ??
    queryClient.getQueryData<Task[]>(TASK_KEYS.all)?.find((task) => task.id === event.payload.id)
  );
}

function makeWebSocketUrl(token: string) {
  const apiUrl = new URL(import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1");
  apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  apiUrl.pathname = `${apiUrl.pathname.replace(/\/$/, "")}/ws`;
  apiUrl.search = "";
  apiUrl.searchParams.set("token", token);
  return apiUrl.toString();
}

function showTaskToast(event: TaskRealtimeEvent, previousTask?: Task) {
  const task = event.payload;

  if (
    event.type === "task_updated" &&
    previousTask?.status &&
    previousTask.status !== task.status
  ) {
    toast.info(
      `${task.title} moved from ${STATUS_LABELS[previousTask.status]} to ${STATUS_LABELS[task.status]}`,
    );
    return;
  }

  if (event.type === "task_created") toast.info(`New task: ${task.title}`);
  if (event.type === "task_updated") toast.info(`Task updated: ${task.title}`);
  if (event.type === "task_deleted") toast.info(`Task deleted: ${task.title}`);
  if (event.type === "task_assigned") toast.info(`Task assigned: ${task.title}`);
  if (event.type === "task_unassigned") toast.info(`Task unassigned: ${task.title}`);
}

export function useTaskRealtime({ projectId, tasks }: UseTaskRealtimeOptions) {
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  const retryTimer = useRef<number | null>(null);

  const subscriptionKey = useMemo(() => {
    const projectIds = projectId
      ? [projectId]
      : Array.from(new Set((tasks ?? []).map((task) => task.project_id)));
    return projectIds.sort().join(",");
  }, [projectId, tasks]);

  useEffect(() => {
    const authToken = token ?? localStorage.getItem("token");
    const projectIds = subscriptionKey.split(",").filter(Boolean);

    if (!authToken || projectIds.length === 0) return;

    let closedByEffect = false;
    let socket: WebSocket | null = null;

    const applyEvent = (event: TaskRealtimeEvent) => {
      const previousTask = findCachedTask(queryClient, event);

      if (event.type === "task_deleted") {
        queryClient.setQueryData<Task[]>(TASK_KEYS.byProject(event.project_id), (old) =>
          removeTask(old, event.payload.id),
        );
        queryClient.setQueryData<Task[]>(TASK_KEYS.all, (old) => removeTask(old, event.payload.id));
        queryClient.removeQueries({ queryKey: TASK_KEYS.detail(event.payload.id) });
      } else {
        queryClient.setQueryData<Task[]>(TASK_KEYS.byProject(event.project_id), (old) =>
          upsertTask(old, event.payload),
        );
        queryClient.setQueryData<Task[]>(TASK_KEYS.all, (old) => {
          if (!old) return old;
          if (!taskMatchesUser(event.payload, user?.id)) return removeTask(old, event.payload.id);
          return upsertTask(old, event.payload);
        });
        queryClient.setQueryData<Task>(TASK_KEYS.detail(event.payload.id), event.payload);
      }

      if (event.actor_id !== user?.id) {
        showTaskToast(event, previousTask);
      }
    };

    const connect = () => {
      socket = new WebSocket(makeWebSocketUrl(authToken));

      socket.onopen = () => {
        socket?.send(
          JSON.stringify({
            action: "subscribe",
            projects: projectIds,
          }),
        );
      };

      socket.onmessage = (message) => {
        try {
          applyEvent(JSON.parse(message.data) as TaskRealtimeEvent);
        } catch {
          // Ignore malformed realtime payloads and keep the connection alive.
        }
      };

      socket.onclose = () => {
        if (!closedByEffect) {
          retryTimer.current = window.setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      closedByEffect = true;
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
      socket?.close();
    };
  }, [queryClient, subscriptionKey, token, user?.id]);
}
