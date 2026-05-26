// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  organizations: string[];
  email_verified: boolean;
  profile_picture?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// ─── Organization ─────────────────────────────────────────────────────────────
export type OrgRole = "owner" | "admin" | "member";

export interface OrgMember {
  user_id: string;
  role: OrgRole;
  joined_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  members: OrgMember[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrgRequest {
  name: string;
  description?: string;
}

export interface UpdateOrgRequest {
  name?: string;
  description?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: OrgRole;
}

// ─── Project ──────────────────────────────────────────────────────────────────
export type ProjectStatus = "active" | "completed" | "archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  organization_id: string;
  owner_id: string;
  members: string[];
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  organization_id: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "in_review"
  | "done"
  | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  title: string;
  description: string;
  project_id: string;
  assigned_to: string[];
  created_by: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  project_id: string;
  assigned_to?: string[];
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assigned_to?: string[];
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  tags?: string[];
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
