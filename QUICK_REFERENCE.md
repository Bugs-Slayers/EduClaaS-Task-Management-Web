# TaskFlow - Quick Reference Card

## 🚀 Quick Start Commands

### Backend

```bash
cd /Users/zelda/Documents/EduClaaS/UOR/FINAL_PROJECT/task-management
make docker-run          # Start all services
make docker-down         # Stop all services
make docker-logs         # View logs
```

### Frontend

```bash
cd task-management-web
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm preview            # Preview production build
```

## 🌐 Service URLs

| Service     | URL                          | Description   |
| ----------- | ---------------------------- | ------------- |
| Frontend    | http://localhost:5173        | React app     |
| Backend API | http://localhost:8080        | Go API        |
| API Health  | http://localhost:8080/health | Health check  |
| MailHog UI  | http://localhost:8025        | Email testing |
| MongoDB     | localhost:27017              | Database      |
| Redis       | localhost:6379               | Cache         |

## 📁 Key Files

### Frontend

```
src/
├── App.tsx                    # Main routing
├── main.tsx                   # Entry point
├── api/                       # API clients
├── components/                # UI components
├── hooks/                     # Custom hooks
├── pages/                     # Page components
├── store/auth.store.ts        # Auth state
└── types/index.ts             # TypeScript types
```

### Backend

```
internal/
├── handlers/                  # HTTP handlers
├── services/                  # Business logic
├── models/                    # Data models
├── middleware/                # Middleware
└── database/                  # DB connection
```

## 🔑 Environment Variables

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Backend (.env)

```env
PORT=8080
MONGODB_URI=mongodb://mongodb:27017/taskflow
REDIS_ADDR=redis:6379
JWT_SECRET=your-secret-key
SMTP_HOST=mailhog
SMTP_PORT=1025
```

## 📡 API Endpoints

### Auth

```
POST /api/v1/auth/register    # Register user
POST /api/v1/auth/login       # Login user
```

### Organizations

```
GET    /api/v1/organizations           # List
POST   /api/v1/organizations           # Create
GET    /api/v1/organizations/:id       # Get
PUT    /api/v1/organizations/:id       # Update
DELETE /api/v1/organizations/:id       # Delete
POST   /api/v1/organizations/:id/invite # Invite
```

### Projects

```
GET    /api/v1/projects        # List
POST   /api/v1/projects        # Create
GET    /api/v1/projects/:id    # Get
PUT    /api/v1/projects/:id    # Update
DELETE /api/v1/projects/:id    # Delete
```

### Tasks

```
GET    /api/v1/tasks           # List (with filters)
POST   /api/v1/tasks           # Create
GET    /api/v1/tasks/:id       # Get
PUT    /api/v1/tasks/:id       # Update
DELETE /api/v1/tasks/:id       # Delete
```

## 🎨 UI Components (Shadcn)

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
```

## 🪝 Custom Hooks

```tsx
import { useAuth } from "@/hooks/useAuth";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";

// Usage
const { login, register, logout } = useAuth();
const { organizations, createOrg } = useOrganizations();
const { projects, createProject } = useProjects();
const { tasks, createTask } = useTasks();
```

## 🗄️ State Management

### Auth Store (Zustand)

```tsx
import { useAuthStore } from "@/store/auth.store";

const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
```

### Server State (React Query)

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ["tasks"],
  queryFn: fetchTasks,
});

const mutation = useMutation({
  mutationFn: createTask,
  onSuccess: () => queryClient.invalidateQueries(["tasks"]),
});
```

## 🎯 Common Tasks

### Add New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation in `src/components/layout/Sidebar.tsx`

### Add New API Endpoint

1. Add function in `src/api/`
2. Create custom hook in `src/hooks/`
3. Use hook in component

### Add New UI Component

```bash
# Install from Shadcn
npx shadcn@latest add [component-name]
```

### Add New Type

Add to `src/types/index.ts`:

```tsx
export interface MyType {
  id: string;
  name: string;
}
```

## 🐛 Debugging

### Frontend

```tsx
// Console log
console.log("Debug:", data);

// React Query DevTools (add to App.tsx)
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
<ReactQueryDevtools initialIsOpen={false} />;
```

### Backend

```bash
# View logs
docker logs -f task-management-app

# Check MongoDB
docker exec -it task-management-mongodb mongosh
use taskflow
db.users.find()
```

### Network

```bash
# Test API
curl http://localhost:8080/health
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🔧 Troubleshooting

### Clear Everything

```bash
# Frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Backend
make docker-down
docker volume prune
make docker-run

# Browser
Clear localStorage and cookies
```

### Port Already in Use

```bash
# Find process
lsof -i :8080
lsof -i :5173

# Kill process
kill -9 [PID]
```

## 📚 Documentation

- Frontend Setup: `FRONTEND_SETUP.md`
- Integration Guide: `INTEGRATION_GUIDE.md`
- Backend: `/Users/zelda/Documents/EduClaaS/UOR/FINAL_PROJECT/task-management/README.md`
- API Examples: `/Users/zelda/Documents/EduClaaS/UOR/FINAL_PROJECT/task-management/API_EXAMPLES.md`

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Shadcn UI](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs)
- [Tailwind CSS](https://tailwindcss.com)

## ⚡ Pro Tips

1. **Use React Query DevTools** for debugging API calls
2. **Use Browser DevTools** Network tab to inspect requests
3. **Check MailHog** for all sent emails
4. **Use TypeScript** for type safety
5. **Follow existing patterns** when adding new features
6. **Keep components small** and focused
7. **Use custom hooks** for reusable logic
8. **Test in browser** before building

## 🎉 You're Ready!

Start developing with:

```bash
# Terminal 1 - Backend
cd /Users/zelda/Documents/EduClaaS/UOR/FINAL_PROJECT/task-management
make docker-run

# Terminal 2 - Frontend
cd task-management-web
pnpm dev

# Open browser
open http://localhost:5173
```

**Happy Coding! 🚀**
