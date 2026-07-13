# PrintPress ERP

## Overview
A full-stack printing press management ERP. Covers dashboard analytics, billing, customers, inventory, vendors, expenses, and settings for a print shop, with role-based views (superadmin, admin, staff).

## Tech Stack

### Frontend
- React 19 + TypeScript + Vite 8
- react-router-dom v7 for routing
- Tailwind CSS v4 for styling
- Zustand 5 for state management (no localStorage — data comes from API)
- recharts for dashboard charts
- react-hook-form + zod for forms
- lucide-react for icons, framer-motion for animations

### Backend
- Node.js + Express (TypeScript via tsx)
- better-sqlite3 for persistent SQLite storage
- Database file: `data/printing.db` (auto-created on first run, auto-seeded)
- Runs on port 3001

## Project Architecture
- `src/main.tsx` — app entry, wraps app in `BrowserRouter` and `AuthContext`
- `src/App.tsx` — route definitions; calls `store.initialize()` on mount to load all data from API
- `src/contexts/AuthContext.tsx` — client-side auth (demo users, hardcoded password)
- `src/contexts/store.ts` — Zustand store; all actions call `src/services/api.ts` then update local state
- `src/services/api.ts` — typed fetch wrappers for all REST endpoints (`/api/...`)
- `src/layouts/DashboardLayout.tsx` — authenticated shell (Sidebar + Navbar + `<Outlet />`)
- `src/pages/` — 10 feature pages (Login, Dashboard, Billing, Customers, Inventory, Vendors, Expenses, Bills, Reports, Settings)
- `src/types/` — shared TypeScript interfaces
- `backend/src/index.ts` — Express app, mounts all routers under `/api`
- `backend/src/db.ts` — SQLite schema creation and first-run seed
- `backend/src/routes/` — CRUD routers: customers, inventory, vendors, expenses, bills, settings

## API Routes
All routes prefixed `/api/`:
- `GET/POST /customers`, `PUT/DELETE /customers/:id`
- `GET/POST /inventory`, `PUT/DELETE /inventory/:id`
- `GET/POST /vendors`, `PUT/DELETE /vendors/:id`
- `GET/POST /expenses`, `PUT/DELETE /expenses/:id`
- `GET/POST /bills`, `PUT/DELETE /bills/:id`
- `GET /settings`, `PUT /settings`

Vite proxies `/api` → `http://localhost:3001` in development.

## Demo Credentials
- Username: `superadmin`, `admin`, or `staff`
- Password: `admin123` (same for all roles)

## Development
Two workflows run in parallel:
- **Start backend** — `cd backend && npm run dev` (port 3001, console output)
- **Start application** — `npm run dev` (port 5000, webview)

## User Preferences
None recorded yet.
