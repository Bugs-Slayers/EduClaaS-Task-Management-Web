import { describe, it, expect } from "vitest";
import { orgsApi } from "../organizations";

describe("orgsApi – list", () => {
  it("returns an array of organizations", async () => {
    const res = await orgsApi.list();
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it("organization has required fields", async () => {
    const res = await orgsApi.list();
    const org = res.data.data![0];
    expect(org).toHaveProperty("id");
    expect(org).toHaveProperty("name");
    expect(org).toHaveProperty("owner_id");
    expect(org).toHaveProperty("members");
  });
});

describe("orgsApi – get", () => {
  it("returns a single organization by id", async () => {
    const res = await orgsApi.get("org-1");
    expect(res.data.success).toBe(true);
    expect(res.data.data?.id).toBe("org-1");
    expect(res.data.data?.name).toBe("Test Org");
  });

  it("returns 404 for unknown id", async () => {
    await expect(orgsApi.get("nonexistent")).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});

describe("orgsApi – create", () => {
  it("creates an organization and returns it", async () => {
    const res = await orgsApi.create({ name: "My Org", description: "Desc" });
    expect(res.status).toBe(201);
    expect(res.data.data?.name).toBe("My Org");
  });

  it("works without a description", async () => {
    const res = await orgsApi.create({ name: "No Desc Org" });
    expect(res.data.success).toBe(true);
  });
});

describe("orgsApi – update", () => {
  it("updates an organization successfully", async () => {
    const res = await orgsApi.update("org-1", { name: "Renamed Org" });
    expect(res.data.success).toBe(true);
  });
});

describe("orgsApi – delete", () => {
  it("deletes an organization successfully", async () => {
    const res = await orgsApi.delete("org-1");
    expect(res.data.success).toBe(true);
  });
});

describe("orgsApi – invite", () => {
  it("sends an invitation successfully", async () => {
    const res = await orgsApi.invite("org-1", {
      email: "invite@example.com",
      role: "member",
    });
    expect(res.data.success).toBe(true);
  });

  it("can invite with admin role", async () => {
    const res = await orgsApi.invite("org-1", {
      email: "admin@example.com",
      role: "admin",
    });
    expect(res.data.success).toBe(true);
  });
});
