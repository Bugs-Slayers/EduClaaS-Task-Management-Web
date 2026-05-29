# Activity Diagrams

> Step-by-step process flows showing decision points and parallel activities.

---

## 1. User Authentication Activity

```mermaid
flowchart TD
    Start([🟢 User Opens App]) --> CheckToken{Token in\nlocalStorage?}

    CheckToken -->|Yes| ValidateToken{Token\nvalid?}
    CheckToken -->|No| ShowLogin[Show Login Page]

    ValidateToken -->|Valid| LoadDashboard[Load Dashboard]
    ValidateToken -->|Expired / Invalid| ClearToken[Clear localStorage\n+ Zustand state]
    ClearToken --> ShowLogin

    ShowLogin --> UserChoice{User Action}
    UserChoice -->|Login| FillLoginForm[Fill Email + Password]
    UserChoice -->|Register| FillRegisterForm[Fill Name + Email + Password]

    FillLoginForm --> ValidateLoginForm{Zod\nValidation?}
    ValidateLoginForm -->|Fail| ShowLoginErrors[Show field errors]
    ShowLoginErrors --> FillLoginForm
    ValidateLoginForm -->|Pass| PostLogin[POST /auth/login]

    FillRegisterForm --> ValidateRegisterForm{Zod\nValidation?}
    ValidateRegisterForm -->|Fail| ShowRegisterErrors[Show field errors]
    ShowRegisterErrors --> FillRegisterForm
    ValidateRegisterForm -->|Pass| PostRegister[POST /auth/register]

    PostLogin --> LoginResponse{API\nResponse?}
    LoginResponse -->|200 OK| StoreAuthLogin[Store user + token\nin Zustand + localStorage]
    LoginResponse -->|401 / Error| ShowLoginError[Toast: Login failed]
    ShowLoginError --> FillLoginForm

    PostRegister --> RegisterResponse{API\nResponse?}
    RegisterResponse -->|201 Created| StoreAuthRegister[Store user + token\nin Zustand + localStorage]
    RegisterResponse -->|400 / Error| ShowRegisterError[Toast: Registration failed]
    ShowRegisterError --> FillRegisterForm

    StoreAuthLogin --> LoadDashboard
    StoreAuthRegister --> LoadDashboard

    LoadDashboard --> End([🔴 User on Dashboard])
```

---

## 2. Task Lifecycle Activity

```mermaid
flowchart TD
    Start([🟢 Task Created]) --> StatusTodo[Status: TODO]

    StatusTodo --> AssignUser[Assign to User]
    AssignUser --> SetPriority[Set Priority\nlow / medium / high / critical]
    SetPriority --> SetDueDate[Set Due Date\n& Tags]

    SetDueDate --> StartWork{User starts\nworking?}
    StartWork -->|Yes| StatusInProgress[Status: IN_PROGRESS]
    StartWork -->|No| WaitAssignment[Wait for assignment]
    WaitAssignment --> StartWork

    StatusInProgress --> Blocker{Blocker\nencountered?}
    Blocker -->|Yes| StatusBlocked[Status: BLOCKED]
    Blocker -->|No| SubmitReview[Submit for Review]

    StatusBlocked --> BlockerResolved{Blocker\nresolved?}
    BlockerResolved -->|Yes| StatusInProgress
    BlockerResolved -->|No| StatusBlocked

    SubmitReview --> StatusInReview[Status: IN_REVIEW]

    StatusInReview --> ReviewResult{Review\nOutcome?}
    ReviewResult -->|Changes needed| StatusInProgress
    ReviewResult -->|Approved| StatusDone[Status: DONE]

    StatusDone --> RecordCompletion[Record completed_at\ntimestamp]
    RecordCompletion --> NotifyAssignees[Notify assigned users]
    NotifyAssignees --> End([🔴 Task Complete])

    StatusTodo --> DeleteTask{Delete\ntask?}
    StatusInProgress --> DeleteTask
    StatusBlocked --> DeleteTask
    DeleteTask -->|Yes| ConfirmDelete[Confirm Dialog]
    ConfirmDelete --> RemoveTask[DELETE /tasks/:id]
    RemoveTask --> InvalidateCache[Invalidate React Query cache]
    InvalidateCache --> End2([🔴 Task Deleted])
```

---

## 3. Organization & Project Setup Activity

```mermaid
flowchart TD
    Start([🟢 Authenticated User]) --> GoToOrgs[Navigate to Organizations]

    GoToOrgs --> HasOrgs{Has existing\norganizations?}
    HasOrgs -->|Yes| ViewOrgList[View Organization List]
    HasOrgs -->|No| CreateOrgPrompt[Show Empty State\n+ Create button]

    CreateOrgPrompt --> OpenOrgForm[Open OrgFormDialog]
    ViewOrgList --> OpenOrgForm

    OpenOrgForm --> FillOrgForm[Fill Name + Description]
    FillOrgForm --> ValidateOrg{Valid?}
    ValidateOrg -->|No| ShowOrgErrors[Show errors]
    ShowOrgErrors --> FillOrgForm
    ValidateOrg -->|Yes| PostOrg[POST /organizations]

    PostOrg --> OrgCreated[Organization Created\nUser becomes Owner]
    OrgCreated --> InviteMembers{Invite\nmembers?}

    InviteMembers -->|Yes| OpenInviteDialog[Open InviteDialog]
    OpenInviteDialog --> EnterEmail[Enter email + select role]
    EnterEmail --> PostInvite[POST /organizations/:id/invite]
    PostInvite --> InviteSent[Email sent to invitee]
    InviteSent --> InviteMore{Invite\nmore?}
    InviteMore -->|Yes| OpenInviteDialog
    InviteMore -->|No| GoToProjects

    InviteMembers -->|No| GoToProjects[Navigate to Projects]

    GoToProjects --> HasProjects{Has projects\nin org?}
    HasProjects -->|Yes| ViewProjectList[View Project List]
    HasProjects -->|No| CreateProjectPrompt[Show Empty State\n+ Create button]

    CreateProjectPrompt --> OpenProjectForm[Open ProjectFormDialog]
    ViewProjectList --> OpenProjectForm

    OpenProjectForm --> FillProjectForm[Fill Name, Description,\nStatus, Dates]
    FillProjectForm --> ValidateProject{Valid?}
    ValidateProject -->|No| ShowProjectErrors[Show errors]
    ShowProjectErrors --> FillProjectForm
    ValidateProject -->|Yes| PostProject[POST /projects]

    PostProject --> ProjectCreated[Project Created\nLinked to Organization]
    ProjectCreated --> AddProjectMembers{Add project\nmembers?}

    AddProjectMembers -->|Yes| PostMember[POST /projects/:id/members]
    PostMember --> MemberAdded[Member added to project]
    MemberAdded --> AddProjectMembers
    AddProjectMembers -->|No| GoToTasks[Navigate to Tasks]

    GoToTasks --> End([🔴 Ready to create Tasks])
```

---

## 4. Dashboard Load Activity

```mermaid
flowchart TD
    Start([🟢 User navigates to /dashboard]) --> CheckAuth{isAuthenticated\nin Zustand?}

    CheckAuth -->|No| RedirectLogin[Redirect to /login]
    CheckAuth -->|Yes| InitParallelFetch

    InitParallelFetch --> ParallelFetch["⚡ Parallel React Query Fetches"]

    ParallelFetch --> FetchOrgs[GET /organizations]
    ParallelFetch --> FetchProjects[GET /projects]
    ParallelFetch --> FetchTasks[GET /tasks]
    ParallelFetch --> FetchProfile[GET /profile]

    FetchOrgs --> OrgsCached{In\ncache?}
    OrgsCached -->|Yes, fresh| UseOrgCache[Use cached data]
    OrgsCached -->|No / stale| FetchOrgsAPI[Fetch from API]
    FetchOrgsAPI --> StoreOrgsCache[Store in React Query cache\n5 min stale time]

    FetchProjects --> ProjectsCached{In\ncache?}
    ProjectsCached -->|Yes, fresh| UseProjectCache[Use cached data]
    ProjectsCached -->|No / stale| FetchProjectsAPI[Fetch from API]
    FetchProjectsAPI --> StoreProjectsCache[Store in React Query cache]

    FetchTasks --> TasksCached{In\ncache?}
    TasksCached -->|Yes, fresh| UseTaskCache[Use cached data]
    TasksCached -->|No / stale| FetchTasksAPI[Fetch from API]
    FetchTasksAPI --> StoreTasksCache[Store in React Query cache]

    FetchProfile --> ProfileCached{In\ncache?}
    ProfileCached -->|Yes, fresh| UseProfileCache[Use cached data]
    ProfileCached -->|No / stale| FetchProfileAPI[Fetch from API]
    FetchProfileAPI --> StoreProfileCache[Store in React Query cache]

    UseOrgCache --> RenderStats
    StoreOrgsCache --> RenderStats
    UseProjectCache --> RenderStats
    StoreProjectsCache --> RenderStats
    UseTaskCache --> RenderStats
    StoreTasksCache --> RenderStats
    UseProfileCache --> RenderStats
    StoreProfileCache --> RenderStats

    RenderStats[Render Dashboard\n- Org count\n- Project count\n- Task count\n- Recent tasks\n- Recent projects] --> End([🔴 Dashboard Ready])
```
