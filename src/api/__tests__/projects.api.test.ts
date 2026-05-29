import { describe, it, expect } from "vitest";
import { projectsApi } from "../projects";

describe("projectsApi – list", () => {
  it("returns an array of projects", async () => {
    const res = await projectsApi.list();
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it("project has required fields", async () => {
    const res = await projectsApi.list();
    const project = res.data.data![0];
    expect(project).toHaveProperty("id");
    expect(project).toHaveProperty("name");
    expect(project).toHaveProperty("status");
    expect(project).toHaveProperty("organization_id");
  });

  it("accepts an optional organizationId filter", async () => {
    const res = await projectsApi.list("org-1");
    expect(res.data.success).toBe(true);
  });
});

describe("projectsApi – get", () => {
  it("returns a single project by id", async () => {
    const res = await projectsApi.get("proj-1");
    expect(res.data.success).toBe(true);
    expect(res.data.data?.id).toBe("proj-1");
  });

  it("returns 404 for unknown id", async () => {
    await expect(projectsApi.get("nonexistent")).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});

describe("projectsApi – create", () => {
  it("creates a project and returns it", async () => {
    const res = await projectsApi.create({
      name: "New Project",
      organization_id: "org-1",
    });
    expect(res.status).toBe(201);
    expect(res.data.data?.name).toBe("New Project");
    expect(res.data.data?.organization_id).toBe("org-1");
  });
});

describe("projectsApi – update", () => {
  it("updates a project successfully", async () => {
    const res = await projectsApi.update("proj-1", { name: "Updated Name" });
    expect(res.data.success).toBe(true);
  });
});

describe("projectsApi – delete", () => {
  it("deletes a project successfully", async () => {
    const res = await projectsApi.delete("proj-1");
    expect(res.data.success).toBe(true);
  });
});

describe("projectsApi – addMember", () => {
  it("adds a member to a project successfully", async () => {
    const res = await projectsApi.addMember("proj-1", "user-2");
    expect(res.data.success).toBe(true);
  });
});
