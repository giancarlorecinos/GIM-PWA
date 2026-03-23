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

**GIM** (Gestion de Incidencias y Mantenimiento) is a PWA for managing technical incidents, preventive maintenance tasks, and users. Fully client-side with IndexedDB for offline-first persistence. Spanish language interface.

### Data Flow

```
React Components (forms call CRUD directly)
    ↓ read
Custom Hooks (useLiveQuery from dexie-react-hooks)
    ↓ read filters from          ↓ subscribe to
Zustand Stores (filter state)    Dexie Database (IndexedDB)
```

- **Dexie** (`src/db/database.ts`): Single source of truth. Defines tables (incidents, maintenanceTasks, users) with indexed fields. Exports CRUD functions (`createIncident`, `updateUser`, etc.) that components call directly.
- **Zustand stores** (`src/stores/`): Hold **only UI filter state**, not data. Each module has its own store.
- **Hooks** (`src/hooks/`): Use `useLiveQuery()` to reactively query Dexie, applying filters from Zustand stores client-side. Return `{ data, isLoading }` pattern.
- **Validators** (`src/lib/validators.ts`): Zod schemas used by React Hook Form via `@hookform/resolvers/zod`.

### Key Conventions

- **Database schema versioning**: New tables require a new `db.version(N).stores({...})` call in `database.ts` — must include ALL tables (not just new ones).
- **Dexie indexing**: Only fields listed in `.stores()` can be used with `.orderBy()`. Non-indexed fields must use `.toArray()` then sort in JS.
- **Forms**: React Hook Form + Zod validation. Form components accept optional entity prop for edit mode, call DB functions on submit, show toast via Sonner.
- **Filtering**: Hooks fetch all records then filter in JS. Filters support: array-based multi-select (status, priority), substring search (assignee, searchQuery), exact match (category).
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin). Dark theme with slate-900/950 backgrounds. No separate CSS files.
- **Routing**: React Router v7 with layout route wrapping `<AppShell>`. Routes: `/`, `/incidents`, `/incidents/:id`, `/maintenance`, `/maintenance/:id`, `/users`, `/users/:id`.
- **PWA**: `vite-plugin-pwa` with `registerType: 'autoUpdate'` and Workbox generateSW strategy.
- **npm install note**: Use `--legacy-peer-deps` flag when installing packages due to vite-plugin-pwa peer dependency conflict with Vite 8.
