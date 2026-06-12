# Nebula Digital Library - Frontend

A modern, fast, and feature-rich Single Page Application (SPA) for the Nebula Library Management System. Built with React 19, TypeScript, and Vite, this frontend seamlessly integrates with a Django backend and utilizes Supabase Realtime for instant user notifications.

## 🚀 Live Features

The following core features are fully implemented and working normally:

### 1. Authentication & Security
- **JWT-Based Authentication**: Secure login and registration flows.
- **Dynamic Error Handling**: Deeply nested validation errors from Django are cleanly parsed and displayed on the UI.
- **Protected Routes**: Unauthenticated users are redirected to login, and access to specific pages is guarded by role permissions.

### 2. Role-Based Access Control (RBAC)
The UI dynamically adapts based on the user's role profile (`Member`, `Librarian`, `Supervisor`, `Admin`):
- **Admins**: Full access to all modules, including adding/editing/deleting Library branches.
- **Supervisors**: Can edit or delete Library branches.
- **Librarians**: Can manage book transactions and catalogs but cannot modify infrastructure data.
- **Members**: Can only access the public catalog, their own borrowing history, and personal fines.

### 3. Member Portal
- **Book Catalog**: Browse available books and request to borrow them.
- **Transaction Dashboard**: Track pending requests, active borrowings, and return history.
- **Fines Management**: View active and historical fines for late returns, lost, or damaged books.

### 4. Staff Management Dashboard
- **Circulation Management**: Approve or reject pending borrow requests from members.
- **Fine Issuance**: Manually issue fines for damaged or lost books with a dedicated UI.
- **Branch Management**: (Admin/Supervisor only) Add and manage library branch locations.

### 5. Advanced Real-Time Notifications
Powered by **Supabase Realtime PostgreSQL Replication** and custom frontend hooks, the app delivers instant updates via In-App Toasts and OS Desktop Notifications:
- **Instant Borrow Updates**: Members are instantly notified when staff approve or reject their borrow request.
- **Instant Fine Alerts**: Members receive immediate alerts if a staff member issues a fine against them.
- **Staff Alerts**: Staff members are instantly notified when a new borrow request arrives.
- **Automated Due Date Reminders**: An intelligent frontend-only mechanism calculates days left on active borrows and triggers a reminder Toast 3 days and 1 day before the due date. To prevent spam, this alert is locally throttled to show only once every 6 hours.

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Server State / Data Fetching**: TanStack Query v5 + Axios
- **Client State**: Zustand v5
- **Real-Time Engine**: `@supabase/supabase-js`

## ⚙️ Development Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root directory and configure the following:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run the development server:**
   ```bash
   bun run dev
   ```
