import { describe, it, expect } from "vitest";
import { authApi } from "../auth";

describe("authApi – login", () => {
  it("returns user and token on valid credentials", async () => {
    const res = await authApi.login({
      email: "test@example.com",
      password: "password123",
    });
    expect(res.data.success).toBe(true);
    expect(res.data.data?.token).toBe("mock-jwt-token");
    expect(res.data.data?.user.email).toBe("test@example.com");
  });

  it("returns 401 on invalid credentials", async () => {
    await expect(
      authApi.login({ email: "wrong@example.com", password: "bad" }),
    ).rejects.toMatchObject({ response: { status: 401 } });
  });

  it("response contains user name", async () => {
    const res = await authApi.login({
      email: "test@example.com",
      password: "password123",
    });
    expect(res.data.data?.user.name).toBe("Test User");
  });
});

describe("authApi – register", () => {
  it("returns 201 with user and token on valid data", async () => {
    const res = await authApi.register({
      email: "new@example.com",
      password: "secret123",
      name: "New User",
    });
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data?.token).toBe("mock-jwt-token");
  });

  it("response user reflects submitted name", async () => {
    const res = await authApi.register({
      email: "jane@example.com",
      password: "pass",
      name: "Jane Doe",
    });
    expect(res.data.data?.user.name).toBe("Jane Doe");
  });
});

describe("authApi – getProfile", () => {
  it("returns the current user profile", async () => {
    const res = await authApi.getProfile();
    expect(res.data.success).toBe(true);
    expect(res.data.data?.email).toBe("test@example.com");
  });
});
