# Sequence Diagrams

> Step-by-step message flows for the most critical system interactions.

---

## 1. User Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React App
    participant Axios as Axios Client
    participant Auth as AuthHandler
    participant UserSvc as UserService
    participant PWD as Password Helper
    participant JWT as JWT Helper
    participant MongoDB as MongoDB
    participant Email as EmailService (async)

    User->>FE: Fill register form (name, email, password)
    FE->>FE: Zod validation (min 8 chars password)
    FE->>Axios: POST /api/v1/auth/register
    Axios->>Auth: HTTP POST { email, password, name }
    Auth->>UserSvc: CreateUser(req)
    UserSvc->>MongoDB: FindOne users { email }
    MongoDB-->>UserSvc: Not found
    UserSvc->>PWD: HashPassword(password)
    PWD-->>UserSvc: bcrypt hash
    UserSvc->>MongoDB: InsertOne user document
    MongoDB-->>UserSvc: { InsertedID }
    UserSvc-->>Auth: *User
    Auth->>JWT: GenerateJWT(userID, email, secret)
    JWT-->>Auth: signed token (24h)
    Auth-->>Axios: 201 { success, data: { user, token } }
    Axios-->>FE: Response
    FE->>FE: setAuth(user, token) → Zustand + localStorage
    FE->>FE: Navigate to /dashboard
    FE-->>User: Dashboard + toast "Account created!"
    Auth-)Email: go SendWelcomeEmail(email, name)
    Email-->>User: Welcome email (async)
```

---

## 2. Login & JWT Auth Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React App
    participant Axios as Axios Client
    participant Auth as AuthHandler
    participant UserSvc as UserService
    participant PWD as Password Helper
    participant JWT as JWT Helper
    participant MongoDB as MongoDB

    User->>FE: Fill login form (email, password)
    FE->>FE: Zod validation
    FE->>Axios: POST /api/v1/auth/login
    Axios->>Auth: HTTP POST { email, password }
    Auth->>UserSvc: ValidateCredentials(email, password)
    UserSvc->>MongoDB: FindOne users { email }
    MongoDB-->>UserSvc: User document (with hashed password)
    UserSvc->>PWD: CheckPassword(password, hash)
    PWD-->>UserSvc: true / false
    alt Invalid credentials
        UserSvc-->>Auth: error "invalid credentials"
        Auth-->>Axios: 401 { error: "invalid credentials" }
        Axios-->>FE: Error
        FE-->>User: Toast "Login failed"
    else Valid credentials
        UserSvc-->>Auth: *User
        Auth->>JWT: GenerateJWT(userID, email, secret)
        JWT-->>Auth: signed token
        Auth-->>Axios: 200 { data: { user, token } }
        Axios-->>FE: Response
        FE->>FE: setAuth(user, token)
        FE->>FE: Navigate to /dashboard
        FE-->>User: Dashboard + toast "Welcome back!"
    end
```

---

## 3. Protected API Request with JWT Middleware

```mermaid
sequenceDiagram
    participant FE as React App
    participant Axios as Axios Interceptor
    participant RateLimit as Rate Limiter
    participant JWTMw as JWT Middleware
    participant Handler as Route Handler
    participant Service as Service Layer
    participant MongoDB as MongoDB

    FE->>Axios: Any protected API call
    Axios->>Axios: Read token from localStorage
    Axios->>RateLimit: HTTP request + Authorization: Bearer <token>
    RateLimit->>RateLimit: Check IP count (100/min)
    alt Rate limit exceeded
        RateLimit-->>FE: 429 Too Many Requests
    else Within limit
        RateLimit->>JWTMw: Forward request
        JWTMw->>JWTMw: Parse Bearer token
        alt Missing / malformed header
            JWTMw-->>FE: 401 "Authorization header required"
        else Invalid / expired token
            JWTMw-->>FE: 401 "Invalid or expired token"
            FE->>FE: Interceptor: clear localStorage + Zustand
            FE->>FE: window.location = /login
        else Valid token
            JWTMw->>JWTMw: Set user_id + user_email in context
            JWTMw->>Handler: c.Next()
            Handler->>Service: Business logic call
            Service->>MongoDB: DB operation
            MongoDB-->>Service: Result
            Service-->>Handler: Data
            Handler-->>FE: 200 { success, data }
        end
    end
```

---

## 4. Organization Invitation Flow

```mermaid
sequenceDiagram
    actor Admin as Org Admin
    participant FE as React App
    participant OrgH as OrgHandler
    participant OrgSvc as OrgService
    participant InvSvc as InvitationService
    participant MongoDB as MongoDB
    participant Email as EmailService
    actor Invitee as Invited User

    Admin->>FE: Open "Send Invitation" dialog
    Admin->>FE: Enter email + select role (admin/member)
    Admin->>FE: Click "Send"
    FE->>OrgH: POST /api/v1/organizations/:id/invitations
    OrgH->>OrgSvc: CheckUserRole(orgID, adminID, RoleAdmin)
    OrgSvc-->>OrgH: true (admin or owner)
    OrgH->>InvSvc: CreateInvitation(type=org, email, invitedBy, orgID, role)
    InvSvc->>MongoDB: FindOne invitations { pending, email, orgID }
    alt Pending invitation already exists
        MongoDB-->>InvSvc: existing invitation
        InvSvc-->>OrgH: existing invitation (idempotent)
    else No existing invitation
        MongoDB-->>InvSvc: Not found
        InvSvc->>InvSvc: generateToken() → 64-char hex
        InvSvc->>MongoDB: InsertOne invitation (expires in 7 days)
        MongoDB-->>InvSvc: *Invitation
        InvSvc-->>OrgH: *Invitation
    end
    OrgH-->>FE: 201 { data: invitation }
    FE-->>Admin: Toast "Invitation sent!"
    OrgH-)Email: go SendInvitationEmail(email, orgName, inviteLink)
    Email-->>Invitee: HTML invitation email with accept link

    Note over Invitee, MongoDB: ── Invitee accepts ──
    Invitee->>FE: Click accept link → /invitations/accept?token=...
    FE->>OrgH: POST /api/v1/invitations/accept { token }
    OrgH->>InvSvc: GetByToken(token)
    InvSvc-->>OrgH: *Invitation (status=pending)
    OrgH->>OrgH: Verify user email matches invitation email
    OrgH->>OrgSvc: AddMember(orgID, userID, role)
    OrgSvc->>MongoDB: UpdateOne $addToSet members
    OrgH->>OrgSvc: AddOrganizationToUser(userID, orgID)
    OrgH->>InvSvc: UpdateStatus(invID, accepted)
    OrgH-->>FE: 200 "Invitation accepted successfully"
    FE-->>Invitee: Toast "Joined organization!"
```

---

## 5. Task Creation with Email Notification

```mermaid
sequenceDiagram
    actor User
    participant FE as React App
    participant TaskH as TaskHandler
    participant ProjSvc as ProjectService
    participant TaskSvc as TaskService
    participant UserSvc as UserService
    participant MongoDB as MongoDB
    participant Email as EmailService
    actor Assignee as Assigned User

    User->>FE: Open TaskFormDialog, fill fields
    User->>FE: Select project, priority, status, assignees
    FE->>TaskH: POST /api/v1/tasks { title, project_id, assigned_to[], ... }
    TaskH->>ProjSvc: CheckUserAccess(projectID, userID)
    ProjSvc->>MongoDB: CountDocuments projects { _id, members: userID }
    MongoDB-->>ProjSvc: count > 0
    ProjSvc-->>TaskH: true
    TaskH->>TaskSvc: CreateTask(req, createdBy)
    TaskSvc->>TaskSvc: Set defaults (status=todo, priority=medium)
    TaskSvc->>MongoDB: InsertOne task document
    MongoDB-->>TaskSvc: *Task
    TaskSvc-->>TaskH: *Task
    TaskH-->>FE: 201 { data: task }
    FE->>FE: Invalidate React Query caches
    FE-->>User: Toast "Task created!" + list refreshed

    TaskH-)Email: go notify assigned users
    loop For each assigned user
        Email->>UserSvc: GetUserByID(assignedUserID)
        UserSvc->>MongoDB: FindOne users
        MongoDB-->>UserSvc: *User
        Email->>Email: SendTaskAssignmentEmail(user.Email, task.Title, project.Name)
        Email-->>Assignee: Task assignment email
    end
```

---

## 6. Task Status Update Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as TaskDetailPage
    participant TaskH as TaskHandler
    participant TaskSvc as TaskService
    participant ProjSvc as ProjectService
    participant MongoDB as MongoDB
    participant RQ as React Query

    User->>FE: Change status dropdown (e.g. in_progress → done)
    FE->>TaskH: PUT /api/v1/tasks/:id { status: "done" }
    TaskH->>TaskSvc: GetTaskByID(taskID)
    TaskSvc->>MongoDB: FindOne tasks { _id }
    MongoDB-->>TaskSvc: *Task
    TaskH->>ProjSvc: CheckUserAccess(task.ProjectID, userID)
    ProjSvc-->>TaskH: true
    TaskH->>TaskSvc: UpdateTask(taskID, { status: "done" })
    TaskSvc->>TaskSvc: Build updates bson.M
    Note over TaskSvc: status=done → set completed_at = now()
    TaskSvc->>MongoDB: UpdateOne $set { status, completed_at, updated_at }
    MongoDB-->>TaskSvc: Updated
    TaskSvc->>MongoDB: FindOne tasks { _id }
    MongoDB-->>TaskSvc: *Task (updated)
    TaskSvc-->>TaskH: *Task
    TaskH-->>FE: 200 { data: updatedTask }
    FE->>RQ: Invalidate ["tasks"], ["tasks", id], ["tasks","project",projectId]
    RQ->>FE: Re-render with new status badge
    FE-->>User: Toast "Task updated!" + DONE badge shown
```
