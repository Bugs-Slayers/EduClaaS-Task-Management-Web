# Activity Diagrams

> Step-by-step process flows showing decision points and parallel activities.

---

## 1. User Authentication Activity

```mermaid
flowchart TD
    Start([🟢 User Opens App]) --> CheckToken{Token in\nlocalStorage?}

    CheckToken -->|Yes| ValidateToken{Zustand\nisAuthenticated?}
    CheckToken -->|No| ShowLogin[Show Login Page]

    ValidateToken -->|true| LoadDashboard[Load Dashboard]
    ValidateToken -->|false| ShowLogin

    ShowLogin --> UserChoice{User Action}
    UserChoice -->|Login| FillLoginForm[Fill Email + Password]
    UserChoice -->|Register| FillRegisterForm["Fill Name + Email + Password<br>min 8 char password"]

    FillLoginForm --> ValidateLogin{Zod\nValidation?}
    ValidateLogin -->|Fail| ShowLoginErrors[Show field errors]
    ShowLoginErrors --> FillLoginForm
    ValidateLogin -->|Pass| PostLogin["POST /api/v1/auth/login"]

    FillRegisterForm --> ValidateRegister{Zod\nValidation?}
    ValidateRegister -->|Fail| ShowRegisterErrors[Show field errors]
    ShowRegisterErrors --> FillRegisterForm
    ValidateRegister -->|Pass| PostRegister["POST /api/v1/auth/register"]

    PostLogin --> LoginResp{API Response?}
    LoginResp -->|200 OK| StoreAuth["setAuth(user, token)<br>Zustand + localStorage"]
    LoginResp -->|401| ShowLoginError[Toast: Invalid credentials]
    LoginResp -->|429| ShowRateError[Toast: Rate limit exceeded]
    ShowLoginError --> FillLoginForm
    ShowRateError --> FillLoginForm

    PostRegister --> RegisterResp{API Response?}
    RegisterResp -->|201 Created| StoreAuth
    RegisterResp -->|400 Email exists| ShowRegisterError[Toast: Email already exists]
    ShowRegisterError --> FillRegisterForm

    StoreAuth --> LoadDashboard
    LoadDashboard --> End([🔴 User on Dashboard])
```

---

## 2. Task Lifecycle Activity

```mermaid
flowchart TD
    Start([🟢 Task Created\nstatus=todo]) --> Assign[Assign to Users\nSet Priority + Due Date + Tags]

    Assign --> StartWork{User starts\nworking?}
    StartWork -->|Yes| InProgress[status: IN_PROGRESS]
    StartWork -->|Waiting| WaitLoop[Wait for assignment]
    WaitLoop --> StartWork

    InProgress --> Blocker{Blocker\nencountered?}
    Blocker -->|Yes| Blocked[status: BLOCKED]
    Blocker -->|No| SubmitReview[Submit for Review]

    Blocked --> BlockerFixed{Blocker\nresolved?}
    BlockerFixed -->|Yes| InProgress
    BlockerFixed -->|No| Blocked

    SubmitReview --> InReview[status: IN_REVIEW]

    InReview --> ReviewResult{Review\nOutcome?}
    ReviewResult -->|Changes needed| InProgress
    ReviewResult -->|Approved| Done[status: DONE]

    Done --> SetCompletedAt[Set completed_at = now\nvia UpdateTask service]
    SetCompletedAt --> NotifyTeam[Notify assigned users\nvia email async]
    NotifyTeam --> End([🔴 Task Complete])

    InProgress --> DeleteCheck{Creator\ndeletes task?}
    InReview --> DeleteCheck
    Blocked --> DeleteCheck
    Done --> DeleteCheck
    DeleteCheck -->|Yes| ConfirmDel[ConfirmDialog shown]
    ConfirmDel --> DelTask[DELETE /api/v1/tasks/:id\nOnly creator allowed]
    DelTask --> InvalidateCache[Invalidate React Query cache]
    InvalidateCache --> End2([🔴 Task Deleted])
```

---

## 3. Invitation Lifecycle Activity

```mermaid
flowchart TD
    Start([🟢 Admin sends invitation]) --> CreateInv["POST /organizations/:id/invitations<br>{ email, role }"]

    CreateInv --> CheckExisting{Pending invitation<br>already exists?}
    CheckExisting -->|Yes| ReturnExisting["Return existing invitation<br>idempotent"]
    CheckExisting -->|No| GenToken["Generate 64-char hex token<br>crypto/rand"]

    GenToken --> SaveInv["Save invitation<br>status=pending<br>expires in 7 days"]
    SaveInv --> SendEmail["Send invitation email<br>async goroutine"]
    ReturnExisting --> SendEmail

    SendEmail --> InviteeAction{Invitee<br>action?}

    InviteeAction -->|Accept| CheckExpiry{Invitation<br>expired?}
    InviteeAction -->|Decline| DeclineInv["POST /invitations/decline<br>status=declined"]
    InviteeAction -->|Ignore| ExpireCheck{7 days<br>passed?}

    CheckExpiry -->|Yes| RejectAccept["400 Invitation no longer valid"]
    CheckExpiry -->|No| CheckEmail{Email matches<br>logged-in user?}

    CheckEmail -->|No| RejectEmail["403 Wrong email address"]
    CheckEmail -->|Yes| AddToResource["Add user to org/project<br>AddMember service"]

    AddToResource --> UpdateStatus["UpdateStatus → accepted"]
    UpdateStatus --> End([🔴 User joined resource])

    DeclineInv --> End2([🔴 Invitation declined])

    ExpireCheck -->|Yes| MarkExpired["ExpireOldInvitations<br>status=expired"]
    MarkExpired --> End3([🔴 Invitation expired])
    ExpireCheck -->|No| InviteeAction

    Start --> AdminRevoke{Admin<br>revokes?}
    AdminRevoke -->|Yes| RevokeInv["DELETE /organizations/:id/invitations/:invId<br>status=revoked"]
    RevokeInv --> End4([🔴 Invitation revoked])
```

---

## 4. Organization & Project Setup Activity

```mermaid
flowchart TD
    Start([🟢 Authenticated User]) --> GoOrgs[Navigate to /organizations]

    GoOrgs --> HasOrgs{Has orgs?}
    HasOrgs -->|Yes| ViewOrgs[View org list]
    HasOrgs -->|No| EmptyOrgs["Show EmptyState<br>+ Create button"]

    EmptyOrgs --> OpenOrgForm[Open OrgFormDialog]
    ViewOrgs --> OpenOrgForm

    OpenOrgForm --> FillOrg["Fill Name + Description"]
    FillOrg --> ValidOrg{Valid?}
    ValidOrg -->|No| OrgErrors[Show errors]
    OrgErrors --> FillOrg
    ValidOrg -->|Yes| PostOrg["POST /api/v1/organizations"]

    PostOrg --> OrgCreated["Org created<br>User = Owner<br>Added to user.organizations"]

    OrgCreated --> InviteMembers{Invite<br>members?}
    InviteMembers -->|Yes| SendInvite["POST /organizations/:id/invitations<br>{ email, role }"]
    SendInvite --> EmailSent["Invitation email sent async"]
    EmailSent --> MoreInvites{More<br>invites?}
    MoreInvites -->|Yes| SendInvite
    MoreInvites -->|No| GoProjects

    InviteMembers -->|No| GoProjects[Navigate to /projects]

    GoProjects --> HasProjects{Has projects?}
    HasProjects -->|Yes| ViewProjects[View project list]
    HasProjects -->|No| EmptyProjects["Show EmptyState<br>+ Create button"]

    EmptyProjects --> OpenProjForm[Open ProjectFormDialog]
    ViewProjects --> OpenProjForm

    OpenProjForm --> FillProj["Fill Name, Description<br>Status, Start/End Dates"]
    FillProj --> ValidProj{Valid?}
    ValidProj -->|No| ProjErrors[Show errors]
    ProjErrors --> FillProj
    ValidProj -->|Yes| CheckOrgAccess["Verify org membership<br>CheckUserAccess"]

    CheckOrgAccess --> AccessOK{Access<br>granted?}
    AccessOK -->|No| ForbiddenError["403 Access denied"]
    AccessOK -->|Yes| PostProj["POST /api/v1/projects"]

    PostProj --> ProjCreated["Project created<br>User = Owner + Member"]
    ProjCreated --> GoTasks[Navigate to /tasks]
    GoTasks --> End([🔴 Ready to create Tasks])
```

---

## 5. Rate Limiter Activity

```mermaid
flowchart TD
    Start([🟢 HTTP Request arrives]) --> GetIP["Extract client IP<br>c.ClientIP"]

    GetIP --> LockMutex["Acquire write lock<br>sync.RWMutex"]

    LockMutex --> VisitorExists{IP in<br>visitors map?}

    VisitorExists -->|No| CreateVisitor["Create visitor<br>count=1, lastSeen=now"]
    CreateVisitor --> UnlockAllow["Release lock"]
    UnlockAllow --> Allow["c.Next() → proceed"]

    VisitorExists -->|Yes| CheckWindow{"Time since<br>lastSeen > window?"}

    CheckWindow -->|Yes, window expired| ResetVisitor["Reset count=1<br>lastSeen=now"]
    ResetVisitor --> UnlockAllow

    CheckWindow -->|No, within window| CheckLimit{"count >=<br>limit (100)?"}

    CheckLimit -->|Yes| UnlockDeny["Release lock"]
    UnlockDeny --> Deny["429 Rate limit exceeded<br>c.Abort"]

    CheckLimit -->|No| IncrCount["count++<br>lastSeen=now"]
    IncrCount --> UnlockAllow

    Allow --> End([🔴 Request processed])
    Deny --> End2([🔴 Request rejected])

    subgraph Cleanup ["Background Cleanup Goroutine (every 1 min)"]
        CleanStart([⏰ Tick]) --> ScanVisitors[Scan all visitors]
        ScanVisitors --> OldVisitor{"lastSeen ><br>window ago?"}
        OldVisitor -->|Yes| DeleteVisitor[Delete from map]
        OldVisitor -->|No| KeepVisitor[Keep]
        DeleteVisitor --> CleanEnd([Done])
        KeepVisitor --> CleanEnd
    end
```
