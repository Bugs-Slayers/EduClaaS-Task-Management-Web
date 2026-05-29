# System Architecture Diagram

> High-level view of the EduClaaS Task Management system — how all layers and services connect.

```mermaid
graph TB
    subgraph Client["🖥️ Client Layer (Browser)"]
        direction TB
        UI["React 19 + TypeScript\nVite + Tailwind CSS + Shadcn UI"]
        Router["React Router v7\nClient-side Routing"]
        ZustandStore["Zustand Store\nAuth State (user, token)"]
        ReactQuery["React Query\nServer State Cache"]
        AxiosClient["Axios HTTP Client\nJWT Interceptor"]
        LocalStorage["localStorage\nToken Persistence"]

        UI --> Router
        UI --> ZustandStore
        UI --> ReactQuery
        ReactQuery --> AxiosClient
        ZustandStore <--> LocalStorage
    end

    subgraph Frontend_Pages["📄 Frontend Pages"]
        direction LR
        AuthPages["Auth Pages\nLogin / Register"]
        Dashboard["Dashboard\nOverview & Stats"]
        OrgPages["Organizations\nList / Detail / Invite"]
        ProjectPages["Projects\nList / Detail"]
        TaskPages["Tasks\nList / Detail"]
        ProfilePage["Profile\nUser Settings"]
    end

    subgraph Backend["⚙️ Backend Layer (Go + Gin)"]
        direction TB
        GinServer["Gin HTTP Server\nPort :8080"]
        CORSMiddleware["CORS Middleware\nAllows localhost:5173"]
        JWTMiddleware["JWT Auth Middleware\nBearer Token Validation"]

        subgraph APIRoutes["API Routes /api/v1"]
            AuthRoutes["Auth Routes\nPOST /auth/register\nPOST /auth/login\nGET  /profile"]
            OrgRoutes["Organization Routes\nGET/POST /organizations\nGET/PUT/DELETE /organizations/:id\nPOST /organizations/:id/invite"]
            ProjectRoutes["Project Routes\nGET/POST /projects\nGET/PUT/DELETE /projects/:id\nPOST /projects/:id/members"]
            TaskRoutes["Task Routes\nGET/POST /tasks\nGET/PUT/DELETE /tasks/:id"]
        end

        GinServer --> CORSMiddleware
        CORSMiddleware --> JWTMiddleware
        JWTMiddleware --> APIRoutes
    end

    subgraph DataLayer["🗄️ Data Layer"]
        MongoDB[("MongoDB\nPrimary Database\nPort 27017")]
        Redis[("Redis\nCache / Sessions\nPort 6379")]

        subgraph Collections["MongoDB Collections"]
            UsersCol["users\n{id, email, name, password,\norganizations[], email_verified}"]
            OrgsCol["organizations\n{id, name, description,\nowner_id, members[]}"]
            ProjectsCol["projects\n{id, name, org_id,\nowner_id, members[], status}"]
            TasksCol["tasks\n{id, title, project_id,\nassigned_to[], status, priority}"]
        end

        MongoDB --> Collections
    end

    subgraph EmailService["📧 Email Service"]
        MailHog["MailHog / SMTP\nPort 8025\nMember Invitations"]
    end

    %% Client to Backend
    AxiosClient -->|"HTTPS REST API\nBearer JWT"| GinServer

    %% Pages to Client Layer
    Frontend_Pages --> UI

    %% Backend to Data
    APIRoutes -->|"CRUD Operations"| MongoDB
    APIRoutes -->|"Cache / Session"| Redis

    %% Backend to Email
    OrgRoutes -->|"Invite Email"| MailHog

    %% Styling
    classDef clientBox fill:#1e3a5f,stroke:#4a9eff,color:#fff
    classDef backendBox fill:#1a3a2a,stroke:#4aff8a,color:#fff
    classDef dataBox fill:#3a1a1a,stroke:#ff6b6b,color:#fff
    classDef emailBox fill:#3a2a1a,stroke:#ffaa4a,color:#fff
    classDef pageBox fill:#2a1a3a,stroke:#aa6bff,color:#fff

    class UI,Router,ZustandStore,ReactQuery,AxiosClient,LocalStorage clientBox
    class GinServer,CORSMiddleware,JWTMiddleware,AuthRoutes,OrgRoutes,ProjectRoutes,TaskRoutes backendBox
    class MongoDB,Redis,UsersCol,OrgsCol,ProjectsCol,TasksCol dataBox
    class MailHog emailBox
    class AuthPages,Dashboard,OrgPages,ProjectPages,TaskPages,ProfilePage pageBox
```

## Key Architectural Decisions

| Concern | Solution | Rationale |
|---|---|---|
| Client state | Zustand | Lightweight, minimal boilerplate for auth state |
| Server state | React Query | Automatic caching, background refetch, cache invalidation |
| Authentication | JWT (Bearer token) | Stateless, scalable, stored in localStorage |
| API communication | Axios + interceptors | Centralized token injection and 401 handling |
| Database | MongoDB | Flexible document model for nested members/tags |
| Cache | Redis | Fast session/cache layer alongside MongoDB |
| Backend framework | Go + Gin | High performance, low latency HTTP server |
| Frontend framework | React + Vite | Fast HMR, TypeScript-first, modern tooling |
