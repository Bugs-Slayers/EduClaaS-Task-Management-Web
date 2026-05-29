# System Architecture Diagram

> Complete architecture of the EduClaaS TaskFlow system — all layers, services, and data flows.

```mermaid
graph TB
    subgraph Client["🖥️ Client Layer (Browser)"]
        direction TB
        UI["React 19 + TypeScript\nVite + Tailwind CSS + Shadcn UI"]
        Router["React Router v7\nClient-side Routing\nAuth Guards"]
        ZustandStore["Zustand Store\nAuth State (user, token, isAuthenticated)"]
        ReactQuery["React Query v4\nServer State Cache\n5-min stale time"]
        AxiosClient["Axios HTTP Client\nRequest Interceptor: attach JWT\nResponse Interceptor: 401 → logout"]
        LocalStorage["localStorage\nToken + User Persistence"]

        UI --> Router
        UI --> ZustandStore
        UI --> ReactQuery
        ReactQuery --> AxiosClient
        ZustandStore <--> LocalStorage
    end

    subgraph FrontendPages["📄 Frontend Pages"]
        direction LR
        AuthPages["Auth\nLogin / Register"]
        Dashboard["Dashboard\nStats + Recent"]
        OrgPages["Organizations\nList / Detail / Members / Invite"]
        ProjectPages["Projects\nList / Detail / Members"]
        TaskPages["Tasks\nList / Detail / Assign"]
        ProfilePage["Profile\nUser Settings"]
    end

    subgraph Backend["⚙️ Backend Layer (Go 1.26 + Gin)"]
        direction TB

        subgraph Middleware["Middleware Stack"]
            CORS["CORS\nAllows FRONTEND_URL"]
            Logger["Logger\nMethod + Path + IP + Status + Duration"]
            RateLimit["Rate Limiter\n100 req/min per IP"]
            JWTMw["JWT Auth Middleware\nBearer token → user_id in context"]
        end

        subgraph PublicRoutes["Public Routes"]
            AuthR["POST /api/v1/auth/register\nPOST /api/v1/auth/login"]
            HealthR["GET /health\nGET /"]
        end

        subgraph ProtectedRoutes["Protected Routes (JWT required)"]
            ProfileR["GET /api/v1/profile"]
            InvR["GET /invitations/my\nPOST /invitations/accept\nPOST /invitations/decline"]
            OrgR["CRUD /organizations\n+ /invitations\n+ /members"]
            ProjR["CRUD /projects\n+ /invitations\n+ /members"]
            TaskR["CRUD /tasks\n+ /assign"]
        end

        subgraph Services["Services (Business Logic)"]
            UserSvc["UserService\nCreateUser, ValidateCredentials\nGetByID/Email, AddOrgToUser"]
            OrgSvc["OrganizationService\nCRUD, AddMember, RemoveMember\nCheckUserAccess, CheckUserRole"]
            ProjSvc["ProjectService\nCRUD, AddMember, RemoveMember\nCheckUserAccess"]
            TaskSvc["TaskService\nCRUD, AssignUsers, UnassignUser\nGetByStatus, GetByPriority"]
            InvSvc["InvitationService\nCreateInvitation, GetByToken\nUpdateStatus, Expire, Revoke"]
        end

        subgraph Helpers["Helpers"]
            JWT["JWT Helper\nGenerateJWT (24h)\nValidateJWT"]
            PWD["Password Helper\nbcrypt Hash + Check"]
            Email["Email Service\nWelcome, Invitation\nProject Invite, Task Assignment"]
            Resp["Response Helper\nSuccessResponse\nErrorResponse"]
        end

        CORS --> Logger --> RateLimit
        RateLimit --> PublicRoutes
        RateLimit --> JWTMw --> ProtectedRoutes
        ProtectedRoutes --> Services
        Services --> Helpers
    end

    subgraph DataLayer["🗄️ Data Layer"]
        MongoDB[("MongoDB\ntaskflow DB\nPort 27017")]
        Redis[("Redis\nCache / Sessions\nPort 6379")]

        subgraph Collections["Collections + Indexes"]
            UsersCol["users\nemail (unique idx)"]
            OrgsCol["organizations\nmembers.user_id (idx)"]
            ProjectsCol["projects\norganization_id (idx)\nmembers (idx)"]
            TasksCol["tasks\nproject_id (idx)\nassigned_to (idx)\nstatus (idx)"]
            InvCol["invitations\ntoken, email, resource_id"]
        end

        MongoDB --> Collections
    end

    subgraph EmailService["📧 Email Service"]
        MailHog["MailHog / SMTP\nPort 1025 (SMTP)\nPort 8025 (Web UI)\nAsync goroutines"]
    end

    %% Client ↔ Backend
    AxiosClient -->|"HTTPS REST\nBearer JWT"| Backend

    %% Pages → Client
    FrontendPages --> UI

    %% Backend → Data
    Services -->|"CRUD"| MongoDB
    Services -->|"Cache"| Redis

    %% Backend → Email (async)
    Email -->|"Async goroutine"| MailHog

    classDef clientBox fill:#1e3a5f,stroke:#4a9eff,color:#fff
    classDef backendBox fill:#1a3a2a,stroke:#4aff8a,color:#fff
    classDef dataBox fill:#3a1a1a,stroke:#ff6b6b,color:#fff
    classDef emailBox fill:#3a2a1a,stroke:#ffaa4a,color:#fff
    classDef pageBox fill:#2a1a3a,stroke:#aa6bff,color:#fff
    classDef mwBox fill:#1a2a3a,stroke:#4affff,color:#fff

    class UI,Router,ZustandStore,ReactQuery,AxiosClient,LocalStorage clientBox
    class CORS,Logger,RateLimit,JWTMw mwBox
    class UserSvc,OrgSvc,ProjSvc,TaskSvc,InvSvc backendBox
    class JWT,PWD,Email,Resp backendBox
    class MongoDB,Redis,UsersCol,OrgsCol,ProjectsCol,TasksCol,InvCol dataBox
    class MailHog emailBox
    class AuthPages,Dashboard,OrgPages,ProjectPages,TaskPages,ProfilePage pageBox
```

## Architecture Decisions

| Concern | Solution | Rationale |
|---|---|---|
| Client state | Zustand + persist | Lightweight auth state with localStorage persistence |
| Server state | React Query | Auto-caching, background refetch, cache invalidation |
| Auth | JWT (24h expiry) | Stateless, scalable; stored in localStorage |
| API layer | Axios + interceptors | Centralized token injection and 401 auto-logout |
| Database | MongoDB | Flexible document model for nested members/tags |
| Cache | Redis | Fast session/cache layer (initialized, ready to use) |
| Email | gomail + MailHog | Async goroutines; MailHog for local dev |
| Rate limiting | Per-IP in-memory | 100 req/min, auto-cleanup goroutine |
| Backend | Go + Gin | High-performance, low-latency HTTP |
| Frontend | React + Vite | Fast HMR, TypeScript-first |

## Layer Responsibilities

```
Handler  → Parse request, validate input, check auth/permissions, call service
Service  → Business logic, DB operations, orchestration
Model    → Data structures, BSON/JSON tags, request/response DTOs
Helper   → JWT, bcrypt, email, response formatting
Middleware → CORS, logging, rate limiting, JWT validation
```
