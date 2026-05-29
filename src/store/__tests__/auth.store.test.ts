import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useAuthStore } from "../auth.store";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  organizations: ["org-1"],
  email_verified: true,
  created_at: "2024-01-01T00:00:00Z",
};

// Reset store state before every test
beforeEach(() => {
  act(() => {
    useAuthStore.getState().clearAuth();
  });
  localStorage.clear();
});

describe("useAuthStore – initial state", () => {
  it("starts unauthenticated", () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("starts with null user", () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("starts with null token", () => {
    expect(useAuthStore.getState().token).toBeNull();
  });
});

describe("useAuthStore – setAuth", () => {
  it("sets isAuthenticated to true", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, "tok-123");
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("stores the user object", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, "tok-123");
    });
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it("stores the token", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, "tok-123");
    });
    expect(useAuthStore.getState().token).toBe("tok-123");
  });

  it("persists token to localStorage", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, "tok-123");
    });
    expect(localStorage.getItem("token")).toBe("tok-123");
  });
});

describe("useAuthStore – clearAuth", () => {
  it("resets isAuthenticated to false", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, "tok-123");
      useAuthStore.getState().clearAuth();
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("clears user to null", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, "tok-123");
      useAuthStore.getState().clearAuth();
    });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("clears token to null", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, "tok-123");
      useAuthStore.getState().clearAuth();
    });
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("removes token from localStorage", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, "tok-123");
      useAuthStore.getState().clearAuth();
    });
    expect(localStorage.getItem("token")).toBeNull();
  });
});

describe("useAuthStore – setAuth then clearAuth cycle", () => {
  it("can set and clear multiple times", () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, "tok-1");
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    act(() => {
      useAuthStore.getState().clearAuth();
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    act(() => {
      useAuthStore.getState().setAuth(mockUser, "tok-2");
    });
    expect(useAuthStore.getState().token).toBe("tok-2");
  });
});
