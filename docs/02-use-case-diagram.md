# Use Case Diagram

> All actors and their interactions with the EduClaaS Task Management system.

```mermaid
graph LR
    %% ── Actors ──────────────────────────────────────────────────────────────
    Guest(["👤 Guest\n(Unauthenticated)"])
    Member(["👥 Member\n(Authenticated)"])
    Admin(["🛡️ Admin\n(Org Admin)"])
    Owner(["👑 Owner\n(Org Owner)"])

    %% ── System Boundary ─────────────────────────────────────────────────────
    subgraph System["EduClaaS Task Management System"]

        subgraph Auth["🔐 Authentication"]
            UC1["Register Account"]
            UC2["Login"]
            UC3["Logout"]
            UC4["View / Edit Profile"]
        end

        subgraph OrgMgmt["🏢 Organization Management"]
            UC5["View Organizations"]
            UC6["Create Organization"]
            UC7["Edit Organization"]
            UC8["Delete Organization"]
            UC9["Invite Member via Email"]
            UC10["View Organization Members"]
        end

        subgraph ProjMgmt["📁 Project Management"]
            UC11["View Projects"]
            UC12["Create Project"]
            UC13["Edit Project"]
            UC14["Delete Project"]
            UC15["Add Member to Project"]
            UC16["Filter Projects by Organization"]
        end

        subgraph TaskMgmt["✅ Task Management"]
            UC17["View Tasks"]
            UC18["Create Task"]
            UC19["Edit Task"]
            UC20["Delete Task"]
            UC21["Assign Task to Users"]
            UC22["Change Task Status"]
            UC23["Set Task Priority"]
            UC24["Filter Tasks by Status / Priority"]
            UC25["Add Tags to Task"]
            UC26["Set Task Due Date"]
        end

        subgraph Dashboard["📊 Dashboard"]
            UC27["View Summary Stats"]
            UC28["View Recent Tasks"]
            UC29["View Recent Projects"]
        end

    end

    %% ── Guest Use Cases ─────────────────────────────────────────────────────
    Guest --> UC1
    Guest --> UC2

    %% ── Member Use Cases ────────────────────────────────────────────────────
    Member --> UC3
    Member --> UC4
    Member --> UC5
    Member --> UC6
    Member --> UC10
    Member --> UC11
    Member --> UC12
    Member --> UC16
    Member --> UC17
    Member --> UC18
    Member --> UC19
    Member --> UC20
    Member --> UC21
    Member --> UC22
    Member --> UC23
    Member --> UC24
    Member --> UC25
    Member --> UC26
    Member --> UC27
    Member --> UC28
    Member --> UC29

    %% ── Admin extends Member ────────────────────────────────────────────────
    Admin --> UC7
    Admin --> UC9
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15

    %% ── Owner extends Admin ─────────────────────────────────────────────────
    Owner --> UC8

    %% ── Inheritance arrows ──────────────────────────────────────────────────
    Member -.->|"inherits"| Guest
    Admin  -.->|"inherits"| Member
    Owner  -.->|"inherits"| Admin

    %% ── Styling ─────────────────────────────────────────────────────────────
    classDef actor fill:#1e3a5f,stroke:#4a9eff,color:#fff,rx:50
    classDef usecase fill:#1a2a1a,stroke:#4aff8a,color:#fff
    classDef authBox fill:#2a1a3a,stroke:#aa6bff,color:#fff
    classDef orgBox fill:#3a2a1a,stroke:#ffaa4a,color:#fff
    classDef projBox fill:#1a3a3a,stroke:#4affff,color:#fff
    classDef taskBox fill:#3a1a1a,stroke:#ff6b6b,color:#fff
    classDef dashBox fill:#2a2a1a,stroke:#ffff4a,color:#fff

    class Guest,Member,Admin,Owner actor
    class UC1,UC2,UC3,UC4 usecase
    class UC5,UC6,UC7,UC8,UC9,UC10 usecase
    class UC11,UC12,UC13,UC14,UC15,UC16 usecase
    class UC17,UC18,UC19,UC20,UC21,UC22,UC23,UC24,UC25,UC26 usecase
    class UC27,UC28,UC29 usecase
```

## Actor Descriptions

| Actor | Description | Permissions |
|---|---|---|
| **Guest** | Unauthenticated visitor | Register, Login only |
| **Member** | Authenticated user, basic org member | View/create orgs & projects, full task CRUD, dashboard |
| **Admin** | Organization admin role | All Member permissions + edit org, invite members, manage projects |
| **Owner** | Organization owner/creator | All Admin permissions + delete organization |

## Use Case Summary

| Domain | Total Use Cases | Key Actions |
|---|---|---|
| Authentication | 4 | Register, Login, Logout, Profile |
| Organizations | 6 | CRUD + Invite + View Members |
| Projects | 6 | CRUD + Add Members + Filter |
| Tasks | 10 | CRUD + Assign + Status + Priority + Tags + Due Date |
| Dashboard | 3 | Stats + Recent Tasks + Recent Projects |
