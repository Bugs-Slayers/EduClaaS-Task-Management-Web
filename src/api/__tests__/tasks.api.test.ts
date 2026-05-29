import { describe, it, expect } from "vitest";
import { tasksApi } from "../tasks";

describe("tasksApi – list", () => {
  it("returns an array of tasks", async () => {
    const res = await tasksApi.list();
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it("returns at least one task", async () => {
    const res = await tasksApi.list();
    expect(res.data.data?.length).toBeGreaterThan(0);
  });

  it("task has required fields", async () => {
    const res = await tasksApi.list();
    const task = res.data.data![0];
    expect(task).toHaveProperty("id");
    expect(task).toHaveProperty("title");
    expect(task).toHaveProperty("status");
    expect(task).toHaveProperty("priority");
    expect(task).toHaveProperty("project_id");
  });

  it("accepts an optional projectId filter", async () => {
    const res = await tasksApi.list("proj-1");
    expect(res.data.success).toBe(true);
  });
});

describe("tasksApi – get", () => {
  it("returns a single task by id", async () => {
    const res = await tasksApi.get("task-1");
    expect(res.data.success).toBe(true);
    expect(res.data.data?.id).toBe("task-1");
  });

  it("returns 404 for unknown id", async () => {
    await expect(tasksApi.get("nonexistent")).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});

describe("tasksApi – create", () => {
  it("creates a task and returns it", async () => {
    const res = await tasksApi.create({
      title: "New Task",
      project_id: "proj-1",
    });
    expect(res.status).toBe(201);
    expect(res.data.data?.title).toBe("New Task");
    expect(res.data.data?.project_id).toBe("proj-1");
  });
});

describe("tasksApi – update", () => {
  it("updates a task and returns updated data", async () => {
    const res = await tasksApi.update("task-1", { status: "done" });
    expect(res.data.success).toBe(true);
    expect(res.data.data?.status).toBe("done");
  });

  it("can update priority", async () => {
    const res = await tasksApi.update("task-1", { priority: "critical" });
    expect(res.data.data?.priority).toBe("critical");
  });
});

describe("tasksApi – delete", () => {
  it("deletes a task successfully", async () => {
    const res = await tasksApi.delete("task-1");
    expect(res.data.success).toBe(true);
  });
});
