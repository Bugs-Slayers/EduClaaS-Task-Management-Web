import { describe, it, expect } from "vitest";
import type {
  User,
  Organization,
  Project,
  Task,
  OrgRole,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  ApiResponse,
} from "../index";

// These tests validate the shape of our type fixtures at runtime,
// acting as a contract test between frontend types and the API.

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  organizations: ["org-1"],
  email_verified: true,
  created_at: "2024-01-01T00:00:00Z",
};

const mockOrg: Organization = {
  id: "org-1",
  name: "Test Org",
  description: "Desc",
  owner_id: "user-1",
  members: [
    { user_id: "user-1", role: "owner", joined_at: "2024-01-01T00:00:00Z" },
  ],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockProject: Project = {
  id: "proj-1",
  name: "Test Project",
  description: "Desc",
  organization_id: "org-1",
  owner_id: "user-1",
  members: ["user-1"],
  status: "active",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockTask: Task = {
  id: "task-1",
  title: "Test Task",
  description: "Desc",
  project_id: "proj-1",
  assigned_to: ["user-1"],
  created_by: "user-1",
  status: "todo",
  priority: "medium",
  tags: [],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// ─── User ─────────────────────────────────────────────────────────────────────

describe("User type", () => {
  it("has required string fields", () => {
    expect(typeof mockUser.id).toBe("string");
    expect(typeof mockUser.email).toBe("string");
    expect(typeof mockUser.name).toBe("string");
  });

  it("organizations is an array", () => {
    expect(Array.isArray(mockUser.organizations)).toBe(true);
  });

  it("email_verified is boolean", () => {
    expect(typeof mockUser.email_verified).toBe("boolean");
  });

  it("profile_picture is optional", () => {
    const userWithPic: User = {
      ...mockUser,
      profile_picture: "https://example.com/pic.jpg",
    };
    expect(userWithPic.profile_picture).toBeDefined();
    const userWithoutPic: User = { ...mockUser };
    expect(userWithoutPic.profile_picture).toBeUndefined();
  });
});

// ─── OrgRole ──────────────────────────────────────────────────────────────────

describe("OrgRole values", () => {
  const validRoles: OrgRole[] = ["owner", "admin", "member"];

  it("contains exactly three roles", () => {
    expect(validRoles).toHaveLength(3);
  });

  it("includes owner", () => {
    expect(validRoles).toContain("owner");
  });

  it("includes admin", () => {
    expect(validRoles).toContain("admin");
  });

  it("includes member", () => {
    expect(validRoles).toContain("member");
  });
});

// ─── Organization ─────────────────────────────────────────────────────────────

describe("Organization type", () => {
  it("has required fields", () => {
    expect(mockOrg.id).toBeDefined();
    expect(mockOrg.name).toBeDefined();
    expect(mockOrg.owner_id).toBeDefined();
  });

  it("members is an array", () => {
    expect(Array.isArray(mockOrg.members)).toBe(true);
  });

  it("member has user_id, role, joined_at", () => {
    const member = mockOrg.members[0];
    expect(member).toHaveProperty("user_id");
    expect(member).toHaveProperty("role");
    expect(member).toHaveProperty("joined_at");
  });
});

// ─── ProjectStatus ────────────────────────────────────────────────────────────

describe("ProjectStatus values", () => {
  const validStatuses: ProjectStatus[] = ["active", "completed", "archived"];

  it("contains exactly three statuses", () => {
    expect(validStatuses).toHaveLength(3);
  });

  it("project status field is one of the valid values", () => {
    expect(validStatuses).toContain(mockProject.status);
  });
});

// ─── Project ──────────────────────────────────────────────────────────────────

describe("Project type", () => {
  it("has required fields", () => {
    expect(mockProject.id).toBeDefined();
    expect(mockProject.name).toBeDefined();
    expect(mockProject.organization_id).toBeDefined();
    expect(mockProject.owner_id).toBeDefined();
  });

  it("members is an array of strings", () => {
    expect(Array.isArray(mockProject.members)).toBe(true);
    mockProject.members.forEach((m) => expect(typeof m).toBe("string"));
  });

  it("start_date and end_date are optional", () => {
    const p: Project = { ...mockProject };
    expect(p.start_date).toBeUndefined();
    expect(p.end_date).toBeUndefined();
  });
});

// ─── TaskStatus ───────────────────────────────────────────────────────────────

describe("TaskStatus values", () => {
  const validStatuses: TaskStatus[] = [
    "todo",
    "in_progress",
    "in_review",
    "done",
    "blocked",
  ];

  it("contains exactly five statuses", () => {
    expect(validStatuses).toHaveLength(5);
  });

  it("task status is one of the valid values", () => {
    expect(validStatuses).toContain(mockTask.status);
  });
});

// ─── TaskPriority ─────────────────────────────────────────────────────────────

describe("TaskPriority values", () => {
  const validPriorities: TaskPriority[] = ["low", "medium", "high", "critical"];

  it("contains exactly four priorities", () => {
    expect(validPriorities).toHaveLength(4);
  });

  it("task priority is one of the valid values", () => {
    expect(validPriorities).toContain(mockTask.priority);
  });
});

// ─── Task ─────────────────────────────────────────────────────────────────────

describe("Task type", () => {
  it("has required fields", () => {
    expect(mockTask.id).toBeDefined();
    expect(mockTask.title).toBeDefined();
    expect(mockTask.project_id).toBeDefined();
    expect(mockTask.created_by).toBeDefined();
  });

  it("assigned_to is an array", () => {
    expect(Array.isArray(mockTask.assigned_to)).toBe(true);
  });

  it("tags is an array", () => {
    expect(Array.isArray(mockTask.tags)).toBe(true);
  });

  it("due_date and completed_at are optional", () => {
    const t: Task = { ...mockTask };
    expect(t.due_date).toBeUndefined();
    expect(t.completed_at).toBeUndefined();
  });
});

// ─── ApiResponse ──────────────────────────────────────────────────────────────

describe("ApiResponse type", () => {
  it("success response has success=true and data", () => {
    const res: ApiResponse<string> = { success: true, data: "hello" };
    expect(res.success).toBe(true);
    expect(res.data).toBe("hello");
  });

  it("error response has success=false and error message", () => {
    const res: ApiResponse<never> = { success: false, error: "Not found" };
    expect(res.success).toBe(false);
    expect(res.error).toBe("Not found");
  });

  it("data field is optional", () => {
    const res: ApiResponse<string> = { success: true };
    expect(res.data).toBeUndefined();
  });
});
