# TaskFlow Frontend - Setup Guide

## 🎯 Overview

TaskFlow frontend is a modern React application built with:

- **React 19** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool
- **TypeScript** - Type-safe development
- **Shadcn UI** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form + Zod** - Form handling and validation
- **Axios** - HTTP client with interceptors

## 📁 Project Structure

```
src/
├── api/                    # API client functions
│   ├── auth.ts            # Authentication endpoints
│   ├── organizations.ts   # Organization endpoints
│   ├── projects.ts        # Project endpoints
│   └── tasks.ts           # Task endpoints
├── components/
│   ├── layout/            # Layout components
│   │   ├── AppLayout.tsx  # Main app layout with sidebar
│   │   ├── AuthLayout.tsx # Authentication pages layout
│   │   └── Sidebar.tsx    # Navigation sidebar
│   ├── shared/            # Reusable components
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── PageHeader.tsx
│   │   └── StatusBadge.tsx
│   └── ui/                # Shadcn UI components
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useOrganizations.ts
│   ├── useProjects.ts
│   └── useTasks.ts
├── lib/
│   ├── axios.ts           # Axios instance with JWT interceptors
│   └── utils.ts           # Utility functions
├── pages/                 # Page components
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── organizations/
│   │   ├── OrganizationsPage.tsx
│   │   ├── OrgFormDialog.tsx
│   │   └── InviteDialog.tsx
│   ├── projects/
│   │   ├── ProjectsPage.tsx
│   │   └── ProjectFormDialog.tsx
│   └── tasks/
│       ├── TasksPage.tsx
│       └── TaskFormDialog.tsx
├── provider/
│   └── query-provider.tsx # React Query configuration
├── store/
│   └── auth.store.ts      # Zustand auth store
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                # Main app with routing
└── main.tsx               # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Backend API running on `http://localhost:8080`

### Installation

All dependencies are already installed. If you need to reinstall:

```bash
pnpm install
```

### Environment Configuration

The `.env.local` file is already configured:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Running the Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## 🔑 Key Features

### Authentication

- JWT-based authentication
- Login and registration pages
- Automatic token refresh
- Protected routes
- Persistent auth state

### Organizations

- Create and manage organizations
- Invite members via email
- View organization members
- Update organization details

### Projects

- Create projects within organizations
- Assign project managers
- Track project status
- Filter and search projects

### Tasks

- Create and assign tasks
- Set priorities and due dates
- Track task status
- Filter by status, priority, assignee
- Real-time updates

### Dashboard

- Overview statistics
- Recent tasks
- Recent projects
- Quick actions

## 🎨 UI Components

All UI components are from Shadcn UI and fully customizable:

- Alert Dialog
- Avatar
- Badge
- Button
- Card
- Dialog
- Dropdown Menu
- Input
- Label
- Select
- Separator
- Sheet
- Skeleton
- Tabs
- Textarea
- Tooltip

## 🔄 State Management

### Server State (React Query)

- Automatic caching
- Background refetching
- Optimistic updates
- Error handling
- Loading states

### Client State (Zustand)

- Authentication state
- User information
- Token management
- Persistent storage

## 🛣️ Routing

The app uses React Router v7 with the following routes:

### Public Routes

- `/login` - Login page
- `/register` - Registration page

### Protected Routes (requires authentication)

- `/dashboard` - Dashboard overview
- `/organizations` - Organizations management
- `/projects` - Projects management
- `/tasks` - Tasks management

### Route Protection

- Unauthenticated users are redirected to `/login`
- Authenticated users accessing auth pages are redirected to `/dashboard`
- Default route (`/`) redirects based on auth status

## 🔐 Security Features

- JWT token stored in localStorage
- Automatic token injection in API requests
- Token expiration handling
- Automatic logout on 401 responses
- Protected routes with auth guards

## 📡 API Integration

### Axios Configuration

- Base URL from environment variable
- Automatic JWT token injection
- Response interceptors for error handling
- Request/response logging in development

### API Endpoints

**Authentication**

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

**Organizations**

- `GET /organizations` - List organizations
- `POST /organizations` - Create organization
- `GET /organizations/:id` - Get organization details
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization
- `POST /organizations/:id/invite` - Invite member

**Projects**

- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

**Tasks**

- `GET /tasks` - List tasks
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

## 🧪 Testing the Application

### 1. Start the Backend

Make sure the backend is running:

```bash
cd /Users/zelda/Documents/EduClaaS/UOR/FINAL_PROJECT/task-management
make docker-run
```

### 2. Start the Frontend

```bash
cd task-management-web
pnpm dev
```

### 3. Test Flow

1. Open `http://localhost:5173`
2. Register a new account
3. Login with credentials
4. Create an organization
5. Create a project
6. Create tasks
7. Test all CRUD operations

## 🎯 Development Tips

### Hot Module Replacement

Vite provides instant HMR - changes appear immediately without full page reload.

### TypeScript

All types are defined in `src/types/index.ts`. Use them for type safety.

### Form Validation

Forms use React Hook Form + Zod for validation. Check existing forms for patterns.

### API Calls

Use the custom hooks (`useAuth`, `useOrganizations`, etc.) instead of calling API directly.

### Styling

Use Tailwind CSS utility classes. Check `tailwind.config.js` for custom theme.

### Icons

Lucide React icons are available. Import from `lucide-react`.

## 🐛 Troubleshooting

### CORS Issues

Make sure backend CORS is configured to allow `http://localhost:5173`

### API Connection Failed

- Verify backend is running on port 8080
- Check `.env.local` has correct API URL
- Check browser console for errors

### Authentication Issues

- Clear localStorage and try again
- Check JWT token in browser DevTools
- Verify backend JWT secret matches

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Shadcn UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs)
- [React Hook Form](https://react-hook-form.com)

## ✅ Checklist

- [x] Project structure created
- [x] All dependencies installed
- [x] TypeScript types defined
- [x] API client configured
- [x] Authentication flow implemented
- [x] All pages created
- [x] Routing configured
- [x] State management setup
- [x] UI components integrated
- [x] Forms with validation
- [x] Error handling
- [x] Loading states
- [x] Environment configuration

## 🚀 Next Steps

1. Start the development server
2. Test all features
3. Customize styling as needed
4. Add additional features
5. Deploy to production

---

**Happy Coding! 🎉**
