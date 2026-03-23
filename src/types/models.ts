// ── Enums compartidos ─────────────────────────────────────────

export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low'
export type IncidentStatus = 'open' | 'in-progress' | 'resolved' | 'closed'

export type MaintenanceStatus = 'pending' | 'in-progress' | 'completed' | 'overdue'
export type Periodicity = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'one-time'

// ── Modelo de Incidencia ──────────────────────────────────────

export interface Incident {
  id: string
  title: string
  description: string
  priority: IncidentPriority
  status: IncidentStatus
  assignee: string
  reporter: string
  location: string
  category: string
  resolutionNotes: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

// ── Modelo de Tarea de Mantenimiento ──────────────────────────

export interface MaintenanceTask {
  id: string
  title: string
  description: string
  responsiblePerson: string
  scheduledDate: string
  periodicity: Periodicity
  status: MaintenanceStatus
  category: string
  location: string
  completedDate: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

// ── Modelo de Usuario ─────────────────────────────────────────

export type UserRole = 'admin' | 'technician' | 'supervisor' | 'viewer'
export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  department: string
  position: string
  notes: string
  createdAt: string
  updatedAt: string
}

// ── Tipos de Filtros de Usuarios ──────────────────────────────

export interface UserFilters {
  role: UserRole[]
  status: UserStatus[]
  department: string
  searchQuery: string
}

// ── Metricas del Dashboard (computadas) ───────────────────────

export interface DashboardMetrics {
  totalIncidents: number
  openIncidents: number
  criticalOpenIncidents: number
  resolvedThisMonth: number
  totalMaintenanceTasks: number
  completedTasks: number
  overdueTasks: number
  completionPercentage: number
}

// ── Tipos de Filtros ──────────────────────────────────────────

export interface IncidentFilters {
  status: IncidentStatus[]
  priority: IncidentPriority[]
  assignee: string
  category: string
  searchQuery: string
}

export interface MaintenanceFilters {
  status: MaintenanceStatus[]
  periodicity: Periodicity[]
  responsiblePerson: string
  category: string
  searchQuery: string
}
