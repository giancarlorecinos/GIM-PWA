# Documentacion del Proyecto GIM
## Gestion de Incidencias y Mantenimiento — Progressive Web App

**Fecha:** 23 de marzo de 2026
**Desarrollado con:** Claude Code (Anthropic)
**Autor:** Giancarlo Recinos

---

## 1. Descripcion General

GIM es una Progressive Web App (PWA) minimalista para la gestion integral de incidencias tecnicas, mantenimientos preventivos y usuarios. La aplicacion funciona completamente en el navegador sin necesidad de un servidor backend, utilizando IndexedDB como base de datos local para operacion offline-first.

### Caracteristicas Principales
- CRUD completo para Incidencias, Mantenimiento y Usuarios
- Dashboard con metricas en tiempo real y graficos interactivos
- Vista de calendario para tareas de mantenimiento
- Sistema de filtros multi-parametro en todas las vistas
- Busqueda global en tiempo real
- Interfaz responsiva (desktop y movil)
- Capacidad PWA: instalable como app nativa, funciona offline
- Datos de ejemplo precargados para demostracion

---

## 2. Stack Tecnologico

| Capa | Tecnologia | Version | Proposito |
|---|---|---|---|
| Framework | React + TypeScript | 19.2 | Interfaz de usuario con tipado fuerte |
| Build Tool | Vite | 8.0 | Servidor de desarrollo y empaquetado |
| Estilos | Tailwind CSS | 4.2 | Sistema de utilidades CSS |
| Base de Datos | Dexie.js (IndexedDB) | 4.3 | Persistencia local offline-first |
| Estado | Zustand | 5.0 | Manejo de estado de filtros UI |
| Formularios | React Hook Form + Zod | 7.72 / 4.3 | Formularios con validacion por schema |
| Routing | React Router | 7.13 | Navegacion SPA |
| Graficos | Recharts | 3.8 | Visualizaciones del dashboard |
| Calendario | FullCalendar | 6.1 | Vista de calendario de mantenimientos |
| Iconos | Lucide React | 1.0 | Iconografia consistente |
| Notificaciones | Sonner | 2.0 | Toasts de feedback al usuario |
| PWA | vite-plugin-pwa | 1.2 | Service Worker y manifest |
| Fechas | date-fns | — | Formateo y manipulacion de fechas |

---

## 3. Arquitectura de la Aplicacion

### 3.1 Flujo de Datos

```
┌─────────────────────────────────────────────────┐
│                  Componentes React               │
│  (Paginas, Formularios, Listas, Dashboard)       │
│         ↓ leen datos    ↑ llaman CRUD           │
├─────────────────────────────────────────────────┤
│              Custom Hooks (useIncidents, etc.)    │
│         useLiveQuery() — datos reactivos         │
│         ↓ leen filtros        ↓ suscriben a     │
├──────────────────┬──────────────────────────────┤
│  Zustand Stores  │     Dexie Database           │
│  (solo filtros)  │     (IndexedDB)              │
│                  │     Fuente de verdad          │
└──────────────────┴──────────────────────────────┘
```

**Principios clave:**
- Los **Zustand stores** solo manejan estado de filtros de la UI, no datos de negocio
- **Dexie.js** es la unica fuente de verdad. Los componentes llaman funciones CRUD directamente
- Los **hooks** usan `useLiveQuery()` para suscribirse reactivamente a cambios en la DB
- Los **formularios** usan React Hook Form con validacion Zod y llaman las funciones de DB al hacer submit

### 3.2 Estructura de Archivos

```
src/
├── main.tsx                         # Punto de entrada, ejecuta seed
├── App.tsx                          # Router principal con rutas
├── index.css                        # Directivas Tailwind
├── vite-env.d.ts                    # Tipos de Vite
│
├── types/
│   └── models.ts                    # Interfaces y tipos TypeScript
│
├── db/
│   ├── database.ts                  # Esquema Dexie, funciones CRUD
│   └── seed.ts                      # Datos de ejemplo (3 tecnicos, 12 incidencias, 6 tareas)
│
├── lib/
│   ├── utils.ts                     # cn(), generateId(), formatDate(), timeAgo()
│   └── validators.ts                # Schemas Zod para formularios
│
├── stores/
│   ├── useIncidentStore.ts          # Filtros de incidencias
│   ├── useMaintenanceStore.ts       # Filtros + modo vista (lista/calendario)
│   └── useUserStore.ts              # Filtros de usuarios
│
├── hooks/
│   ├── useIncidents.ts              # Query reactivo de incidencias
│   ├── useMaintenanceTasks.ts       # Query reactivo de mantenimiento
│   ├── useUsers.ts                  # Query reactivo de usuarios
│   ├── useDashboardMetrics.ts       # Metricas computadas del dashboard
│   └── useGlobalSearch.ts           # Busqueda cross-entity con debounce
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx             # Shell principal (sidebar + topbar + contenido)
│   │   ├── Sidebar.tsx              # Navegacion lateral (desktop)
│   │   ├── TopBar.tsx               # Barra superior con busqueda global
│   │   └── MobileNav.tsx            # Navegacion inferior (movil)
│   │
│   ├── ui/
│   │   ├── Button.tsx               # Boton con variantes (primary, secondary, danger, ghost)
│   │   ├── Input.tsx                # Campo de texto con label y error
│   │   ├── Select.tsx               # Selector con opciones
│   │   ├── Textarea.tsx             # Area de texto
│   │   ├── Badge.tsx                # Badge de estado/prioridad con colores
│   │   ├── Card.tsx                 # Tarjeta contenedora
│   │   ├── Modal.tsx                # Modal con <dialog>
│   │   ├── ConfirmModal.tsx         # Modal de confirmacion para eliminar
│   │   ├── EmptyState.tsx           # Estado vacio con icono y mensaje
│   │   └── LoadingSpinner.tsx       # Spinner de carga
│   │
│   ├── incidents/
│   │   ├── IncidentForm.tsx         # Formulario crear/editar incidencia
│   │   ├── IncidentCard.tsx         # Tarjeta resumen de incidencia
│   │   ├── IncidentList.tsx         # Grid de tarjetas
│   │   ├── IncidentDetail.tsx       # Vista detallada con acciones
│   │   └── IncidentFilters.tsx      # Panel de filtros
│   │
│   ├── maintenance/
│   │   ├── MaintenanceForm.tsx      # Formulario crear/editar tarea
│   │   ├── MaintenanceCard.tsx      # Tarjeta resumen de tarea
│   │   ├── MaintenanceList.tsx      # Grid de tarjetas
│   │   ├── MaintenanceCalendar.tsx  # Vista calendario (FullCalendar)
│   │   └── MaintenanceFilters.tsx   # Panel de filtros
│   │
│   ├── users/
│   │   ├── UserForm.tsx             # Formulario crear/editar usuario
│   │   ├── UserCard.tsx             # Tarjeta resumen con avatar
│   │   ├── UserList.tsx             # Grid de tarjetas
│   │   └── UserFilters.tsx          # Panel de filtros
│   │
│   └── dashboard/
│       ├── MetricCard.tsx           # Tarjeta KPI (icono + numero + label)
│       ├── IncidentsByPriorityChart.tsx    # Grafico de dona (Recharts)
│       ├── MaintenanceComplianceChart.tsx  # Grafico de barras (Recharts)
│       └── RecentActivityList.tsx          # Feed de actividad reciente
│
└── pages/
    ├── DashboardPage.tsx            # Ruta: /
    ├── IncidentsPage.tsx            # Ruta: /incidents
    ├── IncidentDetailPage.tsx       # Ruta: /incidents/:id
    ├── MaintenancePage.tsx          # Ruta: /maintenance
    ├── MaintenanceDetailPage.tsx    # Ruta: /maintenance/:id
    ├── UsersPage.tsx                # Ruta: /users
    └── UserDetailPage.tsx           # Ruta: /users/:id
```

---

## 4. Modelos de Datos

### 4.1 Incidencia (`Incident`)

| Campo | Tipo | Descripcion |
|---|---|---|
| id | string (UUID) | Identificador unico |
| title | string | Titulo de la incidencia |
| description | string | Descripcion detallada |
| priority | `'critical' \| 'high' \| 'medium' \| 'low'` | Nivel de prioridad |
| status | `'open' \| 'in-progress' \| 'resolved' \| 'closed'` | Estado actual |
| assignee | string | Persona asignada |
| reporter | string | Quien reporto |
| location | string | Ubicacion fisica |
| category | string | Categoria (IT, Electrico, Plomeria, etc.) |
| resolutionNotes | string | Notas de la solucion aplicada |
| createdAt | string (ISO 8601) | Fecha de creacion |
| updatedAt | string (ISO 8601) | Ultima actualizacion |
| resolvedAt | string \| null | Fecha de resolucion |

### 4.2 Tarea de Mantenimiento (`MaintenanceTask`)

| Campo | Tipo | Descripcion |
|---|---|---|
| id | string (UUID) | Identificador unico |
| title | string | Titulo de la tarea |
| description | string | Descripcion detallada |
| responsiblePerson | string | Persona responsable |
| scheduledDate | string (ISO 8601) | Fecha programada |
| periodicity | `'daily' \| 'weekly' \| 'biweekly' \| 'monthly' \| 'quarterly' \| 'yearly' \| 'one-time'` | Frecuencia |
| status | `'pending' \| 'in-progress' \| 'completed' \| 'overdue'` | Estado de cumplimiento |
| category | string | Categoria |
| location | string | Ubicacion |
| completedDate | string \| null | Fecha de completado |
| notes | string | Observaciones |
| createdAt | string (ISO 8601) | Fecha de creacion |
| updatedAt | string (ISO 8601) | Ultima actualizacion |

### 4.3 Usuario (`User`)

| Campo | Tipo | Descripcion |
|---|---|---|
| id | string (UUID) | Identificador unico |
| name | string | Nombre completo |
| email | string | Correo electronico |
| phone | string | Numero de telefono |
| role | `'admin' \| 'technician' \| 'supervisor' \| 'viewer'` | Rol del usuario |
| status | `'active' \| 'inactive'` | Estado de la cuenta |
| department | string | Departamento |
| position | string | Cargo/puesto |
| notes | string | Observaciones |
| createdAt | string (ISO 8601) | Fecha de creacion |
| updatedAt | string (ISO 8601) | Ultima actualizacion |

---

## 5. Rutas de la Aplicacion

| Ruta | Pagina | Descripcion |
|---|---|---|
| `/` | DashboardPage | Metricas KPI, graficos y actividad reciente |
| `/incidents` | IncidentsPage | Listado de incidencias con filtros y boton crear |
| `/incidents/:id` | IncidentDetailPage | Detalle de incidencia con editar/eliminar |
| `/maintenance` | MaintenancePage | Listado/calendario de tareas con filtros |
| `/maintenance/:id` | MaintenanceDetailPage | Detalle de tarea con editar/eliminar |
| `/users` | UsersPage | Listado de usuarios con filtros y boton crear |
| `/users/:id` | UserDetailPage | Detalle de usuario con editar/eliminar |

---

## 6. Funcionalidades por Modulo

### 6.1 Dashboard
- 4 tarjetas KPI: Incidencias abiertas, Criticas abiertas, % Cumplimiento mantenimiento, Tareas vencidas
- Grafico de dona: Incidencias por prioridad (critico, alto, medio, bajo)
- Grafico de barras: Estado de cumplimiento de mantenimiento
- Feed de actividad reciente: Ultimos 8 cambios en incidencias y tareas

### 6.2 Incidencias
- **Crear**: Formulario con titulo, descripcion, prioridad, estado, asignado, reportador, categoria, ubicacion, notas de resolucion
- **Listar**: Grid de tarjetas con badges de prioridad y estado
- **Filtrar**: Por estado, prioridad, categoria y busqueda de texto libre
- **Detalle**: Vista completa con toda la informacion y fechas
- **Editar**: Modal con formulario pre-poblado
- **Eliminar**: Modal de confirmacion antes de eliminar

### 6.3 Mantenimiento
- Mismas operaciones CRUD que incidencias
- Campos adicionales: fecha programada, periodicidad
- **Vista Lista**: Grid de tarjetas con fecha y periodicidad
- **Vista Calendario**: FullCalendar con eventos coloreados por estado
- Toggle para cambiar entre vistas

### 6.4 Usuarios
- CRUD completo con campos: nombre, email, telefono, rol, estado, departamento, cargo
- Avatar generado con la inicial del nombre
- Badges de color por rol (morado=admin, azul=supervisor, verde=tecnico, gris=visualizador)
- Filtros por rol, estado, departamento y busqueda

### 6.5 Busqueda Global
- Barra de busqueda en el TopBar
- Busca simultaneamente en incidencias, mantenimientos y usuarios
- Debounce de 300ms para evitar queries excesivos
- Resultados agrupados con etiquetas: INC (ambar), MNT (verde), USR (morado)
- Click en resultado navega al detalle

---

## 7. Datos de Ejemplo Precargados

La aplicacion incluye datos de ejemplo que se cargan automaticamente cuando la base de datos esta vacia.

### 3 Tecnicos IT

| Nombre | Cargo | Especialidad |
|---|---|---|
| Carlos Martinez | Tecnico de Soporte Senior | Redes y servidores |
| Ana Lopez | Tecnico de Infraestructura | Cableado y telecomunicaciones |
| Roberto Giron | Tecnico de Helpdesk | Soporte a usuarios finales |

### 12 Incidencias

| # | Titulo | Asignado | Prioridad | Estado |
|---|---|---|---|---|
| 1 | Servidor de correo no responde | Carlos Martinez | Critica | Abierta |
| 2 | Firewall con reglas desactualizadas | Carlos Martinez | Alta | En Progreso |
| 3 | Backup nocturno fallo 3 noches | Carlos Martinez | Alta | Resuelta |
| 4 | Switch de piso 2 con puerto danado | Ana Lopez | Media | Abierta |
| 5 | Cableado de red desordenado | Ana Lopez | Baja | En Progreso |
| 6 | Access Point sin senal | Ana Lopez | Alta | Abierta |
| 7 | Instalacion de puntos de red | Ana Lopez | Media | Resuelta |
| 8 | PC de recepcion no enciende | Roberto Giron | Media | En Progreso |
| 9 | Impresora HP atascada | Roberto Giron | Baja | Abierta |
| 10 | Usuario sin acceso a carpeta | Roberto Giron | Media | Resuelta |
| 11 | Instalacion de Office 365 | Roberto Giron | Media | Cerrada |

### 6 Tareas de Mantenimiento

| Tarea | Responsable | Periodicidad | Estado |
|---|---|---|---|
| Actualizacion firmware switches | Ana Lopez | Trimestral | Pendiente |
| Limpieza equipos Data Center | Carlos Martinez | Mensual | Pendiente |
| Verificacion backups semanales | Carlos Martinez | Semanal | En Progreso |
| Revision licencias software | Roberto Giron | Trimestral | Pendiente |
| Mantenimiento preventivo UPS | Carlos Martinez | Mensual | Completada |
| Actualizacion antivirus | Roberto Giron | Mensual | Vencida |

---

## 8. Configuracion PWA

La aplicacion esta configurada como Progressive Web App:

- **Service Worker**: Generado automaticamente por Workbox (estrategia generateSW)
- **Actualizacion**: `registerType: 'autoUpdate'` — se actualiza automaticamente
- **Manifest**: Nombre "GIM", display standalone, tema oscuro (#1e293b)
- **Iconos**: favicon.svg, icon-192.png, icon-512.png
- **Cache**: Todos los archivos estaticos (JS, CSS, HTML, imagenes)

---

## 9. Comandos de Desarrollo

```bash
# Navegar al proyecto
cd "Documents/Claude Code Giancarlo"

# Instalar dependencias (usar --legacy-peer-deps por conflicto de vite-plugin-pwa)
npm install --legacy-peer-deps

# Iniciar servidor de desarrollo
npm run dev

# Verificar tipos TypeScript
npx tsc --noEmit

# Build de produccion
npm run build

# Preview del build de produccion
npm run preview

# Lint
npm run lint
```

### Solucion de Problemas

| Problema | Solucion |
|---|---|
| Pantalla negra sin contenido | Abrir DevTools > Console y verificar errores |
| Datos no aparecen | DevTools > Application > Storage > Clear site data, luego recargar |
| Error al instalar paquetes npm | Usar `--legacy-peer-deps` |
| `npm run dev` no funciona | Verificar que estas en la carpeta correcta del proyecto |

---

## 10. Resumen de la Sesion de Desarrollo

### Actividades Realizadas

1. **Inicializacion del repositorio Git** en la carpeta del proyecto

2. **Planificacion completa** en modo Plan:
   - Definicion del stack tecnologico
   - Diseno de modelos de datos
   - Arquitectura de componentes
   - Hoja de ruta de 10 fases

3. **Fase 0 — Scaffolding**: Creacion del proyecto con Vite, instalacion de 20+ dependencias, configuracion de Tailwind CSS y PWA

4. **Fase 1 — Capa Base**: Tipos TypeScript, base de datos Dexie con esquema e indices, schemas de validacion Zod, utilidades (cn, generateId, formatDate, timeAgo)

5. **Fase 2 — Layout**: AppShell responsivo, Sidebar con navegacion, TopBar con busqueda global, MobileNav con tabs inferiores

6. **Fase 3 — Componentes UI**: Button, Input, Select, Textarea, Badge, Card, Modal, ConfirmModal, EmptyState, LoadingSpinner

7. **Fase 4 — Modulo de Incidencias**: Store Zustand, hook reactivo, formulario con validacion, listado con tarjetas, detalle completo, filtros multi-parametro

8. **Fase 5 — Modulo de Mantenimiento**: Store con modo vista, formulario con date picker y periodicidad, listado, calendario FullCalendar, filtros

9. **Fase 6 — Dashboard**: Hook de metricas computadas, 4 tarjetas KPI, grafico de dona (incidencias por prioridad), grafico de barras (cumplimiento), feed de actividad reciente

10. **Fase 7 — Busqueda Global**: Hook con debounce, busqueda cross-entity, dropdown de resultados con navegacion

11. **Correccion de errores**:
    - Fix de `EntityTable` → `Table` en Dexie 4.3
    - Fix de `useMemo` → `useEffect` en hook de debounce
    - Fix de `orderBy` en campo no indexado (RecentActivityList)
    - Instalacion de dependencia faltante `react-is` para Recharts
    - Creacion de `vite-env.d.ts` faltante
    - Fix de tipos Zod con `.default()` vs campos requeridos

12. **Modulo de Usuarios**: Modelo, validador, base de datos (schema v2), store, hook, componentes (Form, Card, List, Filters), paginas, integracion en navegacion y busqueda global

13. **Datos de ejemplo**: Seed automatico con 3 tecnicos IT, 12 incidencias variadas y 6 tareas de mantenimiento

14. **Documentacion**: Creacion de CLAUDE.md para futuras sesiones de desarrollo

---

*Documento generado el 23 de marzo de 2026 durante sesion de desarrollo con Claude Code.*
