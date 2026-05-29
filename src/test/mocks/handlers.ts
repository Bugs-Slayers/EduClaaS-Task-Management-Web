import { http, HttpResponse } from "msw";
import type {
  ApiResponse,
  AuthResponse,
  Organization,
  Project,
  Task,
} from "@/types";

const BASE = "http://localhost:8080/api/v1";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  organizations: ["org-1"],
  email_verified: true,
  created_at: "2024-01-01T00:00:00Z",
};

export const mockToken = "mock-jwt-token";

export const mockOrg: Organization = {
  id: "org-1",
  name: "Test Org",
  description: "A test organization",
  owner_id: "user-1",
  members: [
    { user_id: "user-1", role: "owner", joined_at: "2024-01-01T00:00:00Z" },
  ],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const mockProject: Project = {
  id: "proj-1",
  name: "Test Project",
  description: "A test project",
  organization_id: "org-1",
  owner_id: "user-1",
  members: ["user-1"],
  status: "active",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const mockTask: Task = {
  id: "task-1",
  title: "Test Task",
  description: "A test task",
  project_id: "proj-1",
  assigned_to: ["user-1"],
  created_by: "user-1",
  status: "todo",
  priority: "medium",
  tags: ["frontend"],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// ─── Auth Handlers ────────────────────────────────────────────────────────────

export const handlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json<ApiResponse<AuthResponse>>({
        success: true,
        data: { user: mockUser, token: mockToken },
      });
    }
    return HttpResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid credentials" },
      { status: 401 },
    );
  }),

  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      name: string;
    };
    if (!body.email || !body.password || !body.name) {
      return HttpResponse.json<ApiResponse<never>>(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }
    return HttpResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        data: {
          user: { ...mockUser, email: body.email, name: body.name },
          token: mockToken,
        },
      },
      { status: 201 },
    );
  }),

  http.get(`${BASE}/profile`, () => {
    return HttpResponse.json<ApiResponse<typeof mockUser>>({
      success: true,
      data: mockUser,
    });
  }),

  // ─── Organization Handlers ─────────────────────────────────────────────────

  http.get(`${BASE}/organizations`, () => {
    return HttpResponse.json<ApiResponse<Organization[]>>({
      success: true,
      data: [mockOrg],
    });
  }),

  http.get(`${BASE}/organizations/:id`, ({ params }) => {
    if (params.id === "org-1") {
      return HttpResponse.json<ApiResponse<Organization>>({
        success: true,
        data: mockOrg,
      });
    }
    return HttpResponse.json<ApiResponse<never>>(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }),

  http.post(`${BASE}/organizations`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      description?: string;
    };
    return HttpResponse.json<ApiResponse<Organization>>(
      {
        success: true,
        data: {
          ...mockOrg,
          name: body.name,
          description: body.description ?? "",
        },
      },
      { status: 201 },
    );
  }),

  http.put(`${BASE}/organizations/:id`, () => {
    return HttpResponse.json<ApiResponse<null>>({ success: true, data: null });
  }),

  http.delete(`${BASE}/organizations/:id`, () => {
    return HttpResponse.json<ApiResponse<null>>({ success: true, data: null });
  }),

  http.post(`${BASE}/organizations/:id/invite`, () => {
    return HttpResponse.json<ApiResponse<null>>({ success: true, data: null });
  }),

  // ─── Project Handlers ──────────────────────────────────────────────────────

  http.get(`${BASE}/projects`, () => {
    return HttpResponse.json<ApiResponse<Project[]>>({
      success: true,
      data: [mockProject],
    });
  }),

  http.get(`${BASE}/projects/:id`, ({ params }) => {
    if (params.id === "proj-1") {
      return HttpResponse.json<ApiResponse<Project>>({
        success: true,
        data: mockProject,
      });
    }
    return HttpResponse.json<ApiResponse<never>>(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }),

  http.post(`${BASE}/projects`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      organization_id: string;
    };
    return HttpResponse.json<ApiResponse<Project>>(
      {
        success: true,
        data: {
          ...mockProject,
          name: body.name,
          organization_id: body.organization_id,
        },
      },
      { status: 201 },
    );
  }),

  http.put(`${BASE}/projects/:id`, () => {
    return HttpResponse.json<ApiResponse<null>>({ success: true, data: null });
  }),

  http.delete(`${BASE}/projects/:id`, () => {
    return HttpResponse.json<ApiResponse<null>>({ success: true, data: null });
  }),

  http.post(`${BASE}/projects/:id/members`, () => {
    return HttpResponse.json<ApiResponse<null>>({ success: true, data: null });
  }),

  // ─── Task Handlers ─────────────────────────────────────────────────────────

  http.get(`${BASE}/tasks`, () => {
    return HttpResponse.json<ApiResponse<Task[]>>({
      success: true,
      data: [mockTask],
    });
  }),

  http.get(`${BASE}/tasks/:id`, ({ params }) => {
    if (params.id === "task-1") {
      return HttpResponse.json<ApiResponse<Task>>({
        success: true,
        data: mockTask,
      });
    }
    return HttpResponse.json<ApiResponse<never>>(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }),

  http.post(`${BASE}/tasks`, async ({ request }) => {
    const body = (await request.json()) as {
      title: string;
      project_id: string;
    };
    return HttpResponse.json<ApiResponse<Task>>(
      {
        success: true,
        data: { ...mockTask, title: body.title, project_id: body.project_id },
      },
      { status: 201 },
    );
  }),

  http.put(`${BASE}/tasks/:id`, async ({ request }) => {
    const body = (await request.json()) as Partial<Task>;
    return HttpResponse.json<ApiResponse<Task>>({
      success: true,
      data: { ...mockTask, ...body },
    });
  }),

  http.delete(`${BASE}/tasks/:id`, () => {
    return HttpResponse.json<ApiResponse<null>>({ success: true, data: null });
  }),
];
