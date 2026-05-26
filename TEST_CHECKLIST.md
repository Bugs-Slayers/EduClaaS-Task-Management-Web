# TaskFlow Frontend - Testing Checklist

## ✅ Pre-Flight Checks

### Backend Status

- [ ] Backend is running: `curl http://localhost:8080/health`
- [ ] MongoDB is accessible
- [ ] Redis is accessible
- [ ] MailHog is running: `open http://localhost:8025`

### Frontend Status

- [ ] All dependencies installed: `pnpm list`
- [ ] `.env.local` exists with `VITE_API_URL`
- [ ] No TypeScript errors
- [ ] Dev server starts: `pnpm dev`

## 🧪 Manual Testing Guide

### 1. Authentication Flow

#### Registration

1. Navigate to `http://localhost:5173`
2. Click "Create one" or go to `/register`
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!@#
4. Click "Register"
5. **Expected**: Redirect to `/dashboard`
6. **Verify**: Check MailHog for welcome email

#### Login

1. Logout (if logged in)
2. Go to `/login`
3. Enter credentials:
   - Email: test@example.com
   - Password: Test123!@#
4. Click "Sign in"
5. **Expected**: Redirect to `/dashboard`
6. **Verify**: User info in sidebar

#### Logout

1. Click user avatar in sidebar
2. Click "Logout"
3. **Expected**: Redirect to `/login`
4. **Verify**: Cannot access `/dashboard`

### 2. Organizations

#### Create Organization

1. Navigate to `/organizations`
2. Click "Create Organization"
3. Fill form:
   - Name: Test Org
   - Description: Test organization
4. Click "Create"
5. **Expected**: Organization appears in list
6. **Verify**: Card shows name and description

#### View Organization

1. Click on organization card
2. **Expected**: Shows organization details
3. **Verify**: Members list is visible

#### Update Organization

1. Click "..." menu on organization card
2. Click "Edit"
3. Change name to "Updated Org"
4. Click "Save"
5. **Expected**: Name updates in list
6. **Verify**: Changes persist after refresh

#### Invite Member

1. Click "..." menu on organization card
2. Click "Invite Member"
3. Enter email: newmember@example.com
4. Click "Send Invite"
5. **Expected**: Success message
6. **Verify**: Check MailHog for invitation email

#### Delete Organization

1. Click "..." menu on organization card
2. Click "Delete"
3. Confirm deletion
4. **Expected**: Organization removed from list
5. **Verify**: Cannot be accessed anymore

### 3. Projects

#### Create Project

1. Navigate to `/projects`
2. Click "Create Project"
3. Fill form:
   - Name: Test Project
   - Description: Test project description
   - Organization: Select from dropdown
   - Status: Active
4. Click "Create"
5. **Expected**: Project appears in list
6. **Verify**: Shows correct organization

#### Filter Projects

1. Use organization filter dropdown
2. Select an organization
3. **Expected**: Only projects from that org shown
4. **Verify**: Count updates correctly

#### Update Project

1. Click "..." menu on project card
2. Click "Edit"
3. Change status to "Completed"
4. Click "Save"
5. **Expected**: Status badge updates
6. **Verify**: Changes persist

#### Delete Project

1. Click "..." menu on project card
2. Click "Delete"
3. Confirm deletion
4. **Expected**: Project removed from list

### 4. Tasks

#### Create Task

1. Navigate to `/tasks`
2. Click "Create Task"
3. Fill form:
   - Title: Test Task
   - Description: Task description
   - Project: Select from dropdown
   - Status: Todo
   - Priority: High
   - Due Date: Select future date
4. Click "Create"
5. **Expected**: Task appears in list
6. **Verify**: Shows correct priority badge

#### Filter Tasks by Status

1. Click "All Status" dropdown
2. Select "In Progress"
3. **Expected**: Only in-progress tasks shown
4. **Verify**: Count updates

#### Filter Tasks by Priority

1. Click "All Priorities" dropdown
2. Select "High"
3. **Expected**: Only high-priority tasks shown

#### Update Task Status

1. Click on task card
2. Click "Edit"
3. Change status to "In Progress"
4. Click "Save"
5. **Expected**: Status badge updates
6. **Verify**: Task moves to correct filter

#### Assign Task

1. Edit task
2. Select assignee from dropdown
3. Click "Save"
4. **Expected**: Assignee shown on task card

#### Delete Task

1. Click "..." menu on task card
2. Click "Delete"
3. Confirm deletion
4. **Expected**: Task removed from list

### 5. Dashboard

#### View Statistics

1. Navigate to `/dashboard`
2. **Expected**: See stat cards:
   - Total Organizations
   - Total Projects
   - Total Tasks
3. **Verify**: Numbers match actual counts

#### Recent Tasks

1. Check "Recent Tasks" section
2. **Expected**: Shows last 5 tasks
3. **Verify**: Click task navigates to `/tasks`

#### Recent Projects

1. Check "Recent Projects" section
2. **Expected**: Shows last 5 projects
3. **Verify**: Click project navigates to `/projects`

### 6. Navigation

#### Sidebar Navigation

1. Click each menu item:
   - Dashboard
   - Organizations
   - Projects
   - Tasks
2. **Expected**: Navigates to correct page
3. **Verify**: Active item is highlighted

#### Breadcrumbs

1. Navigate through pages
2. **Expected**: URL updates correctly
3. **Verify**: Browser back/forward works

### 7. Error Handling

#### Invalid Login

1. Go to `/login`
2. Enter wrong credentials
3. **Expected**: Error message shown
4. **Verify**: Stays on login page

#### Network Error

1. Stop backend
2. Try to create organization
3. **Expected**: Error toast shown
4. **Verify**: Form doesn't clear

#### Validation Errors

1. Try to create task without title
2. **Expected**: Validation error shown
3. **Verify**: Form highlights error field

### 8. UI/UX

#### Loading States

1. Perform any action
2. **Expected**: Loading spinner shown
3. **Verify**: Button disabled during loading

#### Empty States

1. Create new account
2. Visit each page
3. **Expected**: Empty state message shown
4. **Verify**: "Create" button is visible

#### Responsive Design

1. Resize browser window
2. **Expected**: Layout adapts
3. **Verify**: Mobile menu works (if implemented)

#### Dialogs

1. Open any dialog
2. **Expected**: Backdrop darkens
3. **Verify**: ESC key closes dialog
4. **Verify**: Click outside closes dialog

### 9. Data Persistence

#### Refresh Page

1. Create some data
2. Refresh page (F5)
3. **Expected**: Data still visible
4. **Verify**: Auth state persists

#### Logout and Login

1. Create data
2. Logout
3. Login again
4. **Expected**: Data still visible

### 10. Performance

#### Page Load Time

1. Open DevTools Network tab
2. Navigate to each page
3. **Expected**: Loads in < 1 second
4. **Verify**: No unnecessary API calls

#### API Caching

1. Visit `/tasks`
2. Navigate away
3. Return to `/tasks`
4. **Expected**: Data loads from cache
5. **Verify**: No duplicate API calls

## 🔍 Browser Console Checks

### No Errors

- [ ] No red errors in console
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] No TypeScript errors

### Network Tab

- [ ] All API calls return 200/201
- [ ] Authorization header present
- [ ] Response data is correct
- [ ] No failed requests

### Application Tab

- [ ] `token` in localStorage
- [ ] `auth-storage` in localStorage
- [ ] Values are correct

## 🧪 API Integration Tests

### Check Request Headers

```javascript
// In browser console
fetch("http://localhost:8080/api/v1/organizations", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})
  .then((r) => r.json())
  .then(console.log);
```

### Check Response Format

1. Open Network tab
2. Perform action
3. Check response:
   - Status code
   - Response body
   - Headers

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Authentication:
- Registration: ☐ Pass ☐ Fail
- Login: ☐ Pass ☐ Fail
- Logout: ☐ Pass ☐ Fail

Organizations:
- Create: ☐ Pass ☐ Fail
- Read: ☐ Pass ☐ Fail
- Update: ☐ Pass ☐ Fail
- Delete: ☐ Pass ☐ Fail
- Invite: ☐ Pass ☐ Fail

Projects:
- Create: ☐ Pass ☐ Fail
- Read: ☐ Pass ☐ Fail
- Update: ☐ Pass ☐ Fail
- Delete: ☐ Pass ☐ Fail
- Filter: ☐ Pass ☐ Fail

Tasks:
- Create: ☐ Pass ☐ Fail
- Read: ☐ Pass ☐ Fail
- Update: ☐ Pass ☐ Fail
- Delete: ☐ Pass ☐ Fail
- Filter: ☐ Pass ☐ Fail
- Assign: ☐ Pass ☐ Fail

Dashboard:
- Statistics: ☐ Pass ☐ Fail
- Recent Items: ☐ Pass ☐ Fail

UI/UX:
- Navigation: ☐ Pass ☐ Fail
- Loading States: ☐ Pass ☐ Fail
- Error Handling: ☐ Pass ☐ Fail
- Responsive: ☐ Pass ☐ Fail

Notes:
_________________________________
_________________________________
_________________________________
```

## 🚀 Quick Test Script

Run this in browser console after logging in:

```javascript
// Quick API test
const token = localStorage.getItem("token");
const baseURL = "http://localhost:8080/api/v1";

async function quickTest() {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Test organizations
  const orgs = await fetch(`${baseURL}/organizations`, { headers }).then((r) =>
    r.json(),
  );
  console.log("✅ Organizations:", orgs);

  // Test projects
  const projects = await fetch(`${baseURL}/projects`, { headers }).then((r) =>
    r.json(),
  );
  console.log("✅ Projects:", projects);

  // Test tasks
  const tasks = await fetch(`${baseURL}/tasks`, { headers }).then((r) =>
    r.json(),
  );
  console.log("✅ Tasks:", tasks);

  console.log("🎉 All API calls successful!");
}

quickTest();
```

## ✅ Success Criteria

All tests pass when:

- ✅ No console errors
- ✅ All CRUD operations work
- ✅ Navigation is smooth
- ✅ Data persists correctly
- ✅ Error messages are clear
- ✅ Loading states are visible
- ✅ UI is responsive
- ✅ API integration works
- ✅ Authentication is secure
- ✅ Emails are sent (MailHog)

## 🎉 Ready for Production!

Once all tests pass, your TaskFlow application is ready for deployment!
