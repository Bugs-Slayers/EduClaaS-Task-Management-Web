# Sequence Diagrams

> Step-by-step message flows for the most critical system interactions.

---

## 1. User Registration & Login Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser as React App
    participant ZustandStore as Zustand Store
    participant AxiosClient as Axios Client
    participant GinServer as Go/Gin Server
    participant MongoDB as MongoDB

    Note over User, MongoDB: ── Registration Flow ──

    User->>Browser: Fill register form (name, email, password)
    Browser->>Browser: Zod validation
    Browser->>AxiosClient: POST /api/v1/auth/register
    AxiosClient->>GinServer: HTTP POST /api/v1/auth/register
    GinServer->>MongoDB: Check if email exists
    MongoDB-->>GinServer: Not found
    GinServer->>GinServer: Hash password (bcrypt)
    GinServer->>MongoDB: Insert new user document
    MongoDB-->>GinServer: User created
    GinServer->>GinServer: Generate JWT token
    GinServer-->>AxiosClient: 201 { user, token }
    AxiosClient-->>Browser: Response data
    Browser->>ZustandStore: setAuth(user, token)
    ZustandStore->>ZustandStore: Persist to localStorage
    Browser->>Browser: Navigate to /dashboard
    Browser-->>User: Dashboard shown + toast "Account created!"

    Note over User, MongoDB: ── Login Flow ──

    User->>Browser: Fill login form (email, password)
    Browser->>Browser: Zod validation
    Browser->>AxiosClient: POST /api/v1/auth/login
    AxiosClient->>GinServer: HTTP POST /api/v1/auth/login
    GinServer->>MongoDB: Find user by email
    MongoDB-->>GinServer: User document
    GinServer->>GinServer: Compare password hash
    GinServer->>GinServer: Generate JWT token
    GinServer-->>AxiosClient: 200 { user, token }
    AxiosClient-->>Browser: Response data
    Browser->>ZustandStore: setAuth(user, token)
    ZustandStore->>ZustandStore: Persist to localStorage
    Browser->>Browser: Navigate to /dashboard
    Browser-->>User: Dashboard shown + toast "Welcome back!"
```

---

## 2. Create Task Flow

```mermaid
sequenceDiagram
    actor User
    participant TaskForm as TaskFormDialog
    participant useCreateTask as useCreateTask Hook
    participant ReactQuery as React Query
    participant AxiosClient as Axios Client
    participant GinServer as Go/Gin Server
    participant JWTMiddleware as JWT Middleware
    participant MongoDB as MongoDB

    User->>TaskForm: Open "New Task" dialog
    User->>TaskForm: Fill title, description, priority, status, due date, tags
    User->>TaskForm: Click "Create Task"
    TaskForm->>TaskForm: Zod schema validation
    TaskForm->>useCreateTask: mutate(taskData)
    useCreateTask->>ReactQuery: trigger mutation
    ReactQuery->>AxiosClient: POST /api/v1/tasks
    AxiosClient->>AxiosClient: Attach Authorization: Bearer <token>
    AxiosClient->>GinServer: HTTP POST /api/v1/tasks
    GinServer->>JWTMiddleware: Validate JWT token
    JWTMiddleware-->>GinServer: User ID extracted
    GinServer->>MongoDB: Insert task document
    MongoDB-->>GinServer: Task created with ID
    GinServer-->>AxiosClient: 201 { success: true, data: task }
    AxiosClient-->>ReactQuery: Response
    ReactQuery->>ReactQuery: Invalidate ["tasks"] cache
    ReactQuery->>ReactQuery: Invalidate ["tasks","project",projectId] cache
    ReactQuery->>AxiosClient: Refetch task list
    AxiosClient->>GinServer: GET /api/v1/tasks
    GinServer->>MongoDB: Query tasks
    MongoDB-->>GinServer: Tasks array
    GinServer-->>AxiosClient: 200 { data: tasks[] }
    AxiosClient-->>ReactQuery: Updated task list
    ReactQuery-->>TaskForm: onSuccess callback
    TaskForm->>TaskForm: Close dialog
    TaskForm-->>User: Toast "Task created!" + list refreshed
```

---

## 3. Organization Invite Member Flow

```mermaid
sequenceDiagram
    actor OrgAdmin as Org Admin
    participant InviteDialog as InviteDialog
    participant useInviteMember as useInviteMember Hook
    participant AxiosClient as Axios Client
    participant GinServer as Go/Gin Server
    participant MongoDB as MongoDB
    participant EmailService as Email Service (MailHog)
    actor InvitedUser as Invited User

    OrgAdmin->>InviteDialog: Open "Invite Member" dialog
    OrgAdmin->>InviteDialog: Enter email + select role (admin/member)
    OrgAdmin->>InviteDialog: Click "Send Invite"
    InviteDialog->>useInviteMember: mutate({ email, role })
    useInviteMember->>AxiosClient: POST /api/v1/organizations/:id/invite
    AxiosClient->>AxiosClient: Attach Bearer token
    AxiosClient->>GinServer: HTTP POST /organizations/:id/invite
    GinServer->>GinServer: Validate JWT + check Admin/Owner role
    GinServer->>MongoDB: Find user by email
    alt User exists
        MongoDB-->>GinServer: User found
        GinServer->>MongoDB: Add user to org members with role
        MongoDB-->>GinServer: Updated
        GinServer->>EmailService: Send invitation email
        EmailService-->>InvitedUser: Invitation email delivered
        GinServer-->>AxiosClient: 200 { success: true }
        AxiosClient-->>InviteDialog: Success
        InviteDialog-->>OrgAdmin: Toast "Invitation sent!" + dialog closes
    else User not found
        MongoDB-->>GinServer: Not found
        GinServer->>EmailService: Send registration invite email
        EmailService-->>InvitedUser: Registration invite email
        GinServer-->>AxiosClient: 200 { success: true }
        AxiosClient-->>InviteDialog: Success
        InviteDialog-->>OrgAdmin: Toast "Invitation sent!"
    end
```

---

## 4. JWT Token Expiry / 401 Auto-Logout Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser as React App
    participant AxiosClient as Axios Client
    participant AxiosInterceptor as Axios Response Interceptor
    participant GinServer as Go/Gin Server
    participant ZustandStore as Zustand Store
    participant LocalStorage as localStorage

    User->>Browser: Perform any authenticated action
    Browser->>AxiosClient: API request
    AxiosClient->>AxiosClient: Attach expired/invalid JWT
    AxiosClient->>GinServer: HTTP request with invalid token
    GinServer->>GinServer: JWT validation fails
    GinServer-->>AxiosClient: 401 Unauthorized
    AxiosClient->>AxiosInterceptor: Error response intercepted
    AxiosInterceptor->>LocalStorage: removeItem("token")
    AxiosInterceptor->>LocalStorage: removeItem("user")
    AxiosInterceptor->>ZustandStore: clearAuth()
    ZustandStore->>ZustandStore: Reset state (user=null, token=null)
    AxiosInterceptor->>Browser: window.location.href = "/login"
    Browser-->>User: Redirected to Login page
```

---

## 5. Task Status Update Flow

```mermaid
sequenceDiagram
    actor User
    participant TaskDetail as TaskDetailPage
    participant useUpdateTask as useUpdateTask Hook
    participant ReactQuery as React Query
    participant AxiosClient as Axios Client
    participant GinServer as Go/Gin Server
    participant MongoDB as MongoDB

    User->>TaskDetail: Open task detail
    TaskDetail->>ReactQuery: useTask(id) query
    ReactQuery->>AxiosClient: GET /api/v1/tasks/:id
    AxiosClient->>GinServer: HTTP GET /tasks/:id
    GinServer->>MongoDB: Find task by ID
    MongoDB-->>GinServer: Task document
    GinServer-->>AxiosClient: 200 { data: task }
    AxiosClient-->>ReactQuery: Task data cached
    ReactQuery-->>TaskDetail: Task rendered

    User->>TaskDetail: Change status dropdown (e.g. todo → in_progress)
    TaskDetail->>useUpdateTask: mutate({ status: "in_progress" })
    useUpdateTask->>AxiosClient: PUT /api/v1/tasks/:id
    AxiosClient->>GinServer: HTTP PUT /tasks/:id { status: "in_progress" }
    GinServer->>MongoDB: Update task status
    MongoDB-->>GinServer: Updated task
    GinServer-->>AxiosClient: 200 { data: updatedTask }
    AxiosClient-->>ReactQuery: onSuccess callback
    ReactQuery->>ReactQuery: Invalidate ["tasks"] cache
    ReactQuery->>ReactQuery: Invalidate ["tasks", id] cache
    ReactQuery->>ReactQuery: Invalidate ["tasks","project",projectId] cache
    ReactQuery-->>TaskDetail: Re-render with new status
    TaskDetail-->>User: Toast "Task updated!" + status badge updated
```
