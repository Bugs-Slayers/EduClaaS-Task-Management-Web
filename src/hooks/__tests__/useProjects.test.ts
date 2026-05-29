import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/test/mocks/server";
import { createTestQueryClient } from "@/test/utils";
import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  PROJECT_KEYS,
} from "../useProjects";

const BASE = "http://localhost:8080/api/v1";

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryClientProvider, {
    client: createTestQueryClient(),
    children,
  });
}

// ─── PROJECT_KEYS ─────────────────────────────────────────────────────────────

describe("PROJECT_KEYS", () => {
  it("all key is ['projects']", () => {
    expect(PROJECT_KEYS.all).toEqual(["projects"]);
  });

  it("byOrg key scopes by orgId", () => {
    expect(PROJECT_KEYS.byOrg("org-1")).toEqual(["projects", "org", "org-1"]);
  });

  it("detail key scopes by project id", () => {
    expect(PROJECT_KEYS.detail("proj-1")).toEqual(["projects", "proj-1"]);
  });

  it("different orgIds produce different byOrg keys", () => {
    expect(PROJECT_KEYS.byOrg("a")).not.toEqual(PROJECT_KEYS.byOrg("b"));
  });
});

// ─── useProjects ──────────────────────────────────────────────────────────────

describe("useProjects", () => {
  it("fetches all projects when no orgId given", async () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].id).toBe("proj-1");
  });

  it("fetches projects with orgId filter", async () => {
    const { result } = renderHook(() => useProjects("org-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it("returns empty array when API returns empty data", async () => {
    server.use(
      http.get(`${BASE}/projects`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
    );
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("enters error state on API failure", async () => {
    server.use(
      http.get(`${BASE}/projects`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    );
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => useProjects(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });
});

// ─── useProject ───────────────────────────────────────────────────────────────

describe("useProject", () => {
  it("fetches a single project by id", async () => {
    const { result } = renderHook(() => useProject("proj-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("proj-1");
    expect(result.current.data?.name).toBe("Test Project");
  });

  it("is disabled (idle) when id is empty string", () => {
    const { result } = renderHook(() => useProject(""), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("project data has expected shape", async () => {
    const { result } = renderHook(() => useProject("proj-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const project = result.current.data!;
    expect(project).toHaveProperty("status");
    expect(project).toHaveProperty("organization_id");
    expect(project).toHaveProperty("owner_id");
    expect(project).toHaveProperty("members");
  });
});

// ─── Mutation hooks initial state ─────────────────────────────────────────────

describe("useCreateProject", () => {
  it("is initially idle", () => {
    const { result } = renderHook(() => useCreateProject(), { wrapper });
    expect(result.current.isIdle).toBe(true);
  });
});

describe("useUpdateProject", () => {
  it("is initially idle", () => {
    const { result } = renderHook(() => useUpdateProject("proj-1"), {
      wrapper,
    });
    expect(result.current.isIdle).toBe(true);
  });
});

describe("useDeleteProject", () => {
  it("is initially idle", () => {
    const { result } = renderHook(() => useDeleteProject(), { wrapper });
    expect(result.current.isIdle).toBe(true);
  });
});
