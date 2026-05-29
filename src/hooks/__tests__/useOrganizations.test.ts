import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/test/mocks/server";
import { createTestQueryClient } from "@/test/utils";
import {
  useOrganizations,
  useOrganization,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useInviteMember,
  ORG_KEYS,
} from "../useOrganizations";

const BASE = "http://localhost:8080/api/v1";

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryClientProvider, {
    client: createTestQueryClient(),
    children,
  });
}

// ─── ORG_KEYS ─────────────────────────────────────────────────────────────────

describe("ORG_KEYS", () => {
  it("all key is ['organizations']", () => {
    expect(ORG_KEYS.all).toEqual(["organizations"]);
  });

  it("detail key includes org id", () => {
    expect(ORG_KEYS.detail("org-1")).toEqual(["organizations", "org-1"]);
  });

  it("different ids produce different detail keys", () => {
    expect(ORG_KEYS.detail("a")).not.toEqual(ORG_KEYS.detail("b"));
  });
});

// ─── useOrganizations ─────────────────────────────────────────────────────────

describe("useOrganizations", () => {
  it("fetches list of organizations", async () => {
    const { result } = renderHook(() => useOrganizations(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe("Test Org");
  });

  it("returns empty array when API returns empty data", async () => {
    server.use(
      http.get(`${BASE}/organizations`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
    );
    const { result } = renderHook(() => useOrganizations(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("enters error state on API failure", async () => {
    server.use(
      http.get(`${BASE}/organizations`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    );
    const { result } = renderHook(() => useOrganizations(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => useOrganizations(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });
});

// ─── useOrganization ──────────────────────────────────────────────────────────

describe("useOrganization", () => {
  it("fetches a single organization by id", async () => {
    const { result } = renderHook(() => useOrganization("org-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("org-1");
    expect(result.current.data?.name).toBe("Test Org");
  });

  it("is disabled (idle) when id is empty string", () => {
    const { result } = renderHook(() => useOrganization(""), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("org data has expected shape", async () => {
    const { result } = renderHook(() => useOrganization("org-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const org = result.current.data!;
    expect(org).toHaveProperty("owner_id");
    expect(org).toHaveProperty("members");
    expect(Array.isArray(org.members)).toBe(true);
  });
});

// ─── Mutation hooks initial state ─────────────────────────────────────────────

describe("useCreateOrganization", () => {
  it("is initially idle", () => {
    const { result } = renderHook(() => useCreateOrganization(), { wrapper });
    expect(result.current.isIdle).toBe(true);
  });
});

describe("useUpdateOrganization", () => {
  it("is initially idle", () => {
    const { result } = renderHook(() => useUpdateOrganization("org-1"), {
      wrapper,
    });
    expect(result.current.isIdle).toBe(true);
  });
});

describe("useDeleteOrganization", () => {
  it("is initially idle", () => {
    const { result } = renderHook(() => useDeleteOrganization(), { wrapper });
    expect(result.current.isIdle).toBe(true);
  });
});

describe("useInviteMember", () => {
  it("is initially idle", () => {
    const { result } = renderHook(() => useInviteMember("org-1"), { wrapper });
    expect(result.current.isIdle).toBe(true);
  });
});
