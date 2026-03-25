# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # TypeScript check + Vite production build (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

No test runner is configured yet.

## Architecture

**Zyncro** is a PWA for managing technical incidents, preventive maintenance, and a ticketing/helpdesk system. It has two data layers: Dexie (IndexedDB, offline-first) for incidents/maintenance, and Firebase (Auth + Firestore, cloud) for the ticketing system and user management. Spanish language interface.

### Tech Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- Firebase v10 modular SDK (Auth + Firestore)
- Dexie.js (IndexedDB) for offline-first local data (incidents, maintenance)
- Zustand for UI filter state
- React Hook Form + Zod for validation
- Recharts for analytics/charts
- FullCalendar for maintenance calendar view
- Sonner for toast notifications
- Lucide React for icons
- vite-plugin-pwa with Workbox

### Data Flow — Offline Module (Incidents/Maintenance)

```
React Components (forms call CRUD directly)
    ↓ read
Custom Hooks (useLiveQuery from dexie-react-hooks)
    ↓ read filters from          ↓ subscribe to
Zustand Stores (filter state)    Dexie Database (IndexedDB)
```

- **Dexie** (`src/db/database.ts`): Defines tables (incidents, maintenanceTasks, users) with indexed fields. Exports CRUD functions.
- **Zustand stores** (`src/stores/`): Hold **only UI filter state**, not data.
- **Hooks** (`src/hooks/`): Use `useLiveQuery()` to reactively query Dexie. Return `{ data, isLoading }` pattern.
- **Validators** (`src/lib/validators.ts`): Zod schemas used by React Hook Form via `@hookform/resolvers/zod`.

### Data Flow — Firebase Module (Tickets/Users/Chat)

```
React Components
    ↓ call CRUD functions from
src/firebase/firestore.ts (addDoc, updateDoc, onSnapshot)
    ↓ real-time subscriptions
Firestore Collections: tickets, users, categories, tickets/{id}/messages
```

- **Auth** (`src/context/AuthContext.tsx`): Firebase Auth with signIn/signUp/logout. Fetches role + isActive from `users/{uid}` doc. Blocks deactivated users on login.
- **Firestore** (`src/firebase/firestore.ts`): CRUD for tickets with RBAC via `buildTicketQuery()`. Customer sees own, agent sees assigned+open, admin sees all.
- **Hooks** (`src/hooks/useTickets.ts`, `useCategories.ts`): Real-time Firestore subscriptions.

### RBAC (3 Roles)

- **customer**: Can create tickets, see own tickets, chat on own tickets.
- **agent**: Can see open tickets + assigned tickets, claim/release, change status.
- **admin**: Full access — all tickets, user management, analytics, categories, dispatch dashboard.

### Key Modules

| Module | Route | Access | Description |
|--------|-------|--------|-------------|
| Tickets | `/tickets`, `/tickets/new`, `/tickets/:id` | All | CRUD, chat, SLA indicators |
| Agent Queue | `/agent/queue` | Agent | Open tickets, claim workflow |
| Agent Assigned | `/agent/assigned` | Agent | Agent's assigned tickets |
| Dispatch Dashboard | `/dispatch` | Admin, Agent | Live radar bubbles + Recharts analytics |
| Admin Users | `/admin/users` | Admin | Role management + active/inactive toggle |
| Admin Analytics | `/admin/analytics` | Admin | Charts by status, priority, ticketType |
| Admin Settings | `/admin/settings` | Admin | Dynamic category CRUD |
| Incidents | `/incidents`, `/incidents/:id` | Admin, Agent | Offline-first incident management |
| Maintenance | `/maintenance`, `/maintenance/:id` | Admin, Agent | Preventive maintenance + calendar |

### Key Conventions

- **Database schema versioning**: New Dexie tables require a new `db.version(N).stores({...})` call — must include ALL tables.
- **Dexie indexing**: Only fields listed in `.stores()` can be used with `.orderBy()`. Non-indexed fields must use `.toArray()` then sort in JS.
- **Firestore composite indexes**: Queries with `where()` + `orderBy()` on different fields require a composite index. If missing, Firestore logs a creation link to the browser console.
- **Firestore `or()` queries**: The `or()` function returns `QueryCompositeFilterConstraint`, not `QueryConstraint`. Build the full `query()` call directly instead of spreading constraints.
- **Forms**: React Hook Form + Zod validation. Form components call DB functions on submit, show toast via Sonner.
- **Styling**: Tailwind CSS v4 dark theme with slate-900/950 backgrounds. No separate CSS files.
- **Routing**: React Router v7 with `<AppShell>` layout route. Routes protected by `<ProtectedRoute allowed={[roles]}>`.
- **PWA**: `vite-plugin-pwa` with `registerType: 'autoUpdate'` and Workbox generateSW strategy.
- **npm install note**: Use `--legacy-peer-deps` flag when installing packages due to vite-plugin-pwa peer dependency conflict with Vite 8.
- **ITIL ticketType**: Tickets have `ticketType` field: `incident`, `service_request`, `question`. Config in `src/lib/ticketTypes.ts`. Old tickets without the field default to `incident`.
- **SLA system**: `src/lib/sla.ts` calculates deadlines based on priority (critical=2h, high=4h, medium=24h, low=48h). Traffic light: green (>25% remaining), yellow (<25%), red (breached). Only for open/in-progress tickets.
- **onSnapshot error handlers**: Always pass an error callback to `onSnapshot()` to prevent Firestore internal assertion crashes when indexes are missing.

### Security

- **`.env`** contains real Firebase credentials — NEVER commit it. Protected by `.gitignore`.
- **`.env.example`** has placeholder values only.
- **`.gitignore`** blocks: `.env.*`, `*.pem`, `*.p12`, `*.key`, `service-account*.json`, `credentials*.json`, `client_secret*.json`, `firebase-adminsdk*.json`, `gcp-key*.json`.
- **Git history was cleaned** with `git filter-repo` to remove previously leaked Firebase config values.
- **User deactivation**: `isActive` field on user docs. AuthContext checks it on login and on auth state change, auto-signs-out deactivated users.

### File Structure (Key Files)

```
src/
├── App.tsx                          # Router with all routes + ProtectedRoute guards
├── context/AuthContext.tsx           # Firebase Auth provider, role + isActive check
├── components/
│   ├── AuthGate.tsx                 # Login/register gate, Zyncro branding
│   ├── ProtectedRoute.tsx           # Route guard by role
│   ├── CreateTicket.tsx             # Ticket form with ticketType + category
│   ├── TicketList.tsx               # Ticket list with SLA + type filters
│   ├── TicketChat.tsx               # Real-time chat (Firestore subcollection)
│   └── layout/
│       ├── AppShell.tsx             # Sidebar + TopBar + content
│       ├── Sidebar.tsx              # RBAC-aware navigation
│       └── MobileNav.tsx            # Mobile bottom tabs
├── firebase/
│   ├── config.ts                    # Firebase init from VITE_ env vars
│   └── firestore.ts                # Ticket CRUD, RBAC queries, user ops
├── hooks/
│   ├── useTickets.ts                # Real-time ticket subscription
│   └── useCategories.ts            # Categories from Firestore
├── lib/
│   ├── ticketTypes.ts              # ITIL type config (icons, colors, labels)
│   └── sla.ts                      # SLA calculation + traffic light styles
├── pages/
│   ├── DispatchDashboardPage.tsx    # Live radar + Recharts analytics
│   ├── AdminUsersPage.tsx           # User role + status management
│   ├── AdminAnalyticsPage.tsx       # Charts (status, priority, type)
│   ├── AdminSettingsPage.tsx        # Dynamic category CRUD
│   ├── AgentQueuePage.tsx           # Open tickets queue
│   ├── AgentAssignedPage.tsx        # Agent's assigned tickets
│   ├── TicketDetailPage.tsx         # Full ticket detail + chat
│   └── ...                          # Incidents, Maintenance, etc.
└── db/
    └── database.ts                  # Dexie IndexedDB schema + CRUD
```
