# TaskFlow Frontend-Backend Integration Guide

## 🔗 Complete Integration Setup

This guide walks you through testing the complete TaskFlow application with both frontend and backend running together.

## 📋 Prerequisites Checklist

- [x] Backend implemented (Go + MongoDB + Redis)
- [x] Frontend implemented (React + Vite + TypeScript)
- [x] Docker and Docker Compose installed
- [x] Node.js 18+ and pnpm installed
- [x] Ports available: 8080 (API), 27017 (MongoDB), 6379 (Redis), 8025 (MailHog), 5173 (Frontend)

## 🚀 Step-by-Step Integration

### Step 1: Start the Backend Services

Open a terminal in the backend directory:

```bash
cd /Users/zelda/Documents/EduClaaS/UOR/FINAL_PROJECT/task-management
```

Start all backend services with Docker:

```bash
make docker-run
```

This will start:

- ✅ MongoDB on port 27017
- ✅ Redis on port 6379
- ✅ MailHog on port 8025 (SMTP: 1025)
- ✅ TaskFlow API on port 8080

**Verify Backend is Running:**

```bash
# Check API health
curl http://localhost:8080/health

# Expected response:
# {"status":"ok"}
```

### Step 2: Start the Frontend Development Server

Open a **new terminal** in the frontend directory:

```bash
cd /Users/zelda/Documents/EduClaaS/UOR/FINAL_PROJECT/task-management/task-management-web
```

Start the Vite development server:

```bash
pnpm dev
```

The frontend will be available at: **http://localhost:5173**

### Step 3: Test the Complete Flow

#### 3.1 User Registration

1. Open browser: `http://localhost:5173`
2. You'll be redirected to `/login`
3. Click "Register" or navigate to `/register`
4. Fill in the registration form:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Password**: SecurePass123!
5. Click "Register"
6. Check MailHog: `http://localhost:8025` for welcome email

#### 3.2 User Login

1. Navigate to `/login`
2. Enter credentials:
   - **Email**: john@example.com
   - **Password**: SecurePass123!
3. Click "Login"
4. You should be redirected to `/dashboard`

#### 3.3 Create Organization

1. Navigate to `/organizations`
2. Click "Create Organization"
3. Fill in the form:
   - **Name**: Acme Corp
   - **Description**: Our main organization
4. Click "Create"
5. Organization should appear in the list

#### 3.4 Invite Team Member

1. In the organizations list, click the "..." menu
2. Select "Invite Member"
3. Enter email: `jane@example.com`
4. Click "Send Invite"
5. Check MailHog for invitation email

#### 3.5 Create Project

1. Navigate to `/projects`
2. Click "Create Project"
3. Fill in the form:
   - **Name**: Website Redesign
   - **Description**: Redesign company website
   - **Organization**: Select "Acme Corp"
   - **Status**: Active
4. Click "Create"
5. Project should appear in the list

#### 3.6 Create Task

1. Navigate to `/tasks`
2. Click "Create Task"
3. Fill in the form:
   - **Title**: Design homepage mockup
   - **Description**: Create initial design concepts
   - **Project**: Select "Website Redesign"
   - **Status**: Todo
   - **Priority**: High
   - **Due Date**: Select a future date
4. Click "Create"
5. Task should appear in the list

#### 3.7 Update Task

1. Click on a task card
2. Click "Edit"
3. Change status to "In Progress"
4. Update priority or other fields
5. Click "Save"
6. Changes should be reflected immediately

#### 3.8 Dashboard Overview

1. Navigate to `/dashboard`
2. Verify you see:
   - Total organizations count
   - Total projects count
   - Total tasks count
   - Recent tasks list
   - Recent projects list

## 🔍 Testing API Integration

### Using Browser DevTools

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Perform any action (create task, update project, etc.)
4. Inspect the API calls:
   - Request URL should be `http://localhost:8080/api/v1/...`
   - Request headers should include `Authorization: Bearer <token>`
   - Response should be JSON with proper data

### Using Postman

Import the Postman collection from the backend:

```bash
/Users/zelda/Documents/EduClaaS/UOR/FINAL_PROJECT/task-management/TaskFlow.postman_collection.json
```

## 🐛 Common Issues and Solutions

### Issue 1: CORS Error

**Symptom**: Browser console shows CORS error

**Solution**: Backend CORS is configured to allow all origins in development. If you still see errors:

1. Check backend logs: `docker logs task-management-app`
2. Verify API is running: `curl http://localhost:8080/health`
3. Restart backend: `make docker-down && make docker-run`

### Issue 2: 401 Unauthorized

**Symptom**: API returns 401 after login

**Solution**:

1. Clear browser localStorage
2. Logout and login again
3. Check JWT token in DevTools → Application → Local Storage
4. Verify token is being sent in request headers

### Issue 3: Connection Refused

**Symptom**: Frontend can't connect to backend

**Solution**:

1. Verify backend is running: `docker ps`
2. Check API port: `lsof -i :8080`
3. Verify `.env.local` has correct API URL
4. Restart both frontend and backend

### Issue 4: MongoDB Connection Error

**Symptom**: Backend logs show MongoDB connection error

**Solution**:

```bash
# Stop all containers
make docker-down

# Remove volumes
docker volume prune

# Restart
make docker-run
```

### Issue 5: Frontend Build Errors

**Symptom**: TypeScript or build errors

**Solution**:

```bash
cd task-management-web

# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Restart dev server
pnpm dev
```

## 📊 Monitoring and Debugging

### Backend Logs

```bash
# View API logs
docker logs -f task-management-app

# View MongoDB logs
docker logs -f task-management-mongodb

# View Redis logs
docker logs -f task-management-redis
```

### Frontend Logs

Check browser console for:

- API request/response logs
- React component errors
- State management updates

### Email Testing

Open MailHog UI: `http://localhost:8025`

- View all sent emails
- Test email templates
- Verify invitation emails

## 🧪 API Endpoints Reference

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Organizations

- `GET /api/v1/organizations` - List user's organizations
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations/:id` - Get organization details
- `PUT /api/v1/organizations/:id` - Update organization
- `DELETE /api/v1/organizations/:id` - Delete organization
- `POST /api/v1/organizations/:id/invite` - Invite member

### Projects

- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Tasks

- `GET /api/v1/tasks` - List tasks (with filters)
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:id` - Get task details
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

## 🎯 Feature Testing Checklist

### Authentication

- [ ] User can register with valid credentials
- [ ] User receives welcome email
- [ ] User can login with credentials
- [ ] Invalid credentials show error
- [ ] JWT token is stored in localStorage
- [ ] Token is sent with API requests
- [ ] User is redirected to dashboard after login
- [ ] User can logout
- [ ] Protected routes redirect to login when not authenticated

### Organizations

- [ ] User can create organization
- [ ] Organization appears in list
- [ ] User can view organization details
- [ ] User can update organization
- [ ] User can delete organization
- [ ] User can invite members
- [ ] Invitation email is sent
- [ ] Organization members are displayed

### Projects

- [ ] User can create project
- [ ] Project is linked to organization
- [ ] Project appears in list
- [ ] User can filter projects by organization
- [ ] User can update project status
- [ ] User can delete project
- [ ] Project details show correct information

### Tasks

- [ ] User can create task
- [ ] Task is linked to project
- [ ] Task appears in list
- [ ] User can filter tasks by status
- [ ] User can filter tasks by priority
- [ ] User can update task status
- [ ] User can assign task to user
- [ ] User can set due date
- [ ] User can delete task
- [ ] Task details show correct information

### Dashboard

- [ ] Statistics show correct counts
- [ ] Recent tasks are displayed
- [ ] Recent projects are displayed
- [ ] Quick actions work correctly

### UI/UX

- [ ] All forms validate input
- [ ] Error messages are displayed
- [ ] Success messages are shown
- [ ] Loading states are visible
- [ ] Empty states are shown when no data
- [ ] Responsive design works on mobile
- [ ] Dialogs open and close correctly
- [ ] Navigation works smoothly

## 🚀 Performance Optimization

### Frontend

- React Query caching reduces API calls
- Optimistic updates for better UX
- Lazy loading for routes (can be added)
- Image optimization (if needed)

### Backend

- MongoDB indexing for fast queries
- Redis caching for frequently accessed data
- Connection pooling
- Rate limiting to prevent abuse

## 📈 Next Steps

### Enhancements

1. Add real-time updates with WebSockets
2. Implement file uploads for tasks
3. Add task comments and activity log
4. Create task templates
5. Add project analytics and reports
6. Implement notifications system
7. Add dark mode support
8. Create mobile app

### Deployment

1. Set up CI/CD pipeline
2. Deploy backend to cloud (AWS, GCP, Azure)
3. Deploy frontend to Vercel/Netlify
4. Configure production database
5. Set up monitoring and logging
6. Configure SSL certificates
7. Set up backup strategy

## ✅ Success Criteria

Your integration is successful when:

- ✅ Backend API responds to all endpoints
- ✅ Frontend connects to backend without errors
- ✅ User can complete full workflow (register → login → create org → create project → create task)
- ✅ All CRUD operations work correctly
- ✅ Emails are sent and visible in MailHog
- ✅ JWT authentication works properly
- ✅ No console errors in browser
- ✅ No errors in backend logs

## 🎉 Congratulations!

You now have a fully functional TaskFlow application with:

- ✅ Complete backend API
- ✅ Modern React frontend
- ✅ Full authentication system
- ✅ Organization management
- ✅ Project management
- ✅ Task management
- ✅ Email notifications
- ✅ Responsive UI

**Happy Task Managing! 🚀**
