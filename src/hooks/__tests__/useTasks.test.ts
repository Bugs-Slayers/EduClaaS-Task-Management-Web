import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/test/mocks/server";
import { createTestQueryClient } from "@/test/utils";
import {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  TASK_KEYS,
} from "../useTasks";

const BASE = "http://localhost:8080/api/v1";

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryClientProvider, {
    client: createTestQueryClient(),
    children,
  });
}

// ─── TASK_KEYS ────────────────────────────────────────────────────────────────

describe("TASK_KEYS", () => {
  it("all key is ['tasks']", () => {
    expect(TASK_KEYS.all).toEqual(["tasks"]);
  });

  it("byProject key scopes by projectId", () => {
    expect(TASK_KEYS.byProject("proj-1")).toEqual([
      "tasks",
      "project",
      "proj-1",
    ]);
  });

  it("detail key scopes by task id", () => {
    expect(TASK_KEYS.detail("task-1")).toEqual(["tasks", "task-1"]);
  });

  it("different projectIds produce different keys", () => {
    expect(TASK_KEYS.byProject("a")).not.toEqual(TASK_KEYS.byProject("b"));
  });
});

// ─── useTasks ─────────────────────────────────────────────────────────────────

describe("useTasks", () => {
  it("fetches all tasks when no projectId given", async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].id).toBe("task-1");
  });

  it("fetches tasks with projectId filter", async () => {
    const { result } = renderHook(() => useTasks("proj-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it("returns empty array when API returns empty data", async () => {
    server.use(
      http.get(`${BASE}/tasks`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
    );
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("enters error state on API failure", async () => {
    server.use(
      http.get(`${BASE}/tasks`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    );
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });
});

// ─── useTask ──────────────────────────────────────────────────────────────────

describe("useTask", () => {
  it("fetches a single task by id", async () => {
    const { result } = renderHook(() => useTask("task-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("task-1");
    expect(result.current.data?.title).toBe("Test Task");
  });

  it("is disabled (idle) when id is empty string", () => {
    const { result } = renderHook(() => useTask(""), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("task data has expected shape", async () => {
    const { result } = renderHook(() => useTask("task-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const task = result.current.data!;
    expect(task).toHaveProperty("status");
    expect(task).toHaveProperty("priority");
    expect(task).toHaveProperty("project_id");
    expect(task).toHaveProperty("assigned_to");
  });
});

// ─── Mutation hooks initial state ─────────────────────────────────────────────

describe("useCreateTask", () => {
  it("is initially idle", () => {
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    expect(result.current.isIdle).toBe(true);
  });

  it("is not pending initially", () => {
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    expect(result.current.isPending).toBe(false);
  });
});

describe("useUpdateTask", () => {
  it("is initially idle", () => {
    const { result } = renderHook(() => useUpdateTask("task-1"), { wrapper });
    expect(result.current.isIdle).toBe(true);
  });
});

describe("useDeleteTask", () => {
  it("is initially idle", () => {
    const { result } = renderHook(() => useDeleteTask(), { wrapper });
    expect(result.current.isIdle).toBe(true);
  });
});
