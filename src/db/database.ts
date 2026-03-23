import Dexie, { type Table } from 'dexie'
import type { Incident, MaintenanceTask, User } from '../types/models'
import { generateId, now } from '../lib/utils'
import type { IncidentFormData, MaintenanceFormData, UserFormData } from '../lib/validators'

const db = new Dexie('GIMDatabase') as Dexie & {
  incidents: Table<Incident, string>
  maintenanceTasks: Table<MaintenanceTask, string>
  users: Table<User, string>
}

db.version(1).stores({
  incidents: 'id, status, priority, category, assignee, createdAt',
  maintenanceTasks: 'id, status, periodicity, category, responsiblePerson, scheduledDate',
})

db.version(2).stores({
  incidents: 'id, status, priority, category, assignee, createdAt',
  maintenanceTasks: 'id, status, periodicity, category, responsiblePerson, scheduledDate',
  users: 'id, email, role, status, department, createdAt',
})

// ── Incidencias ───────────────────────────────────────────────

export async function createIncident(data: IncidentFormData): Promise<string> {
  const id = generateId()
  const timestamp = now()
  await db.incidents.add({
    ...data,
    id,
    createdAt: timestamp,
    updatedAt: timestamp,
    resolvedAt: null,
  })
  return id
}

export async function updateIncident(id: string, data: Partial<IncidentFormData>): Promise<void> {
  const updates: Partial<Incident> = {
    ...data,
    updatedAt: now(),
  }
  if (data.status === 'resolved' || data.status === 'closed') {
    updates.resolvedAt = now()
  }
  await db.incidents.update(id, updates)
}

export async function deleteIncident(id: string): Promise<void> {
  await db.incidents.delete(id)
}

// ── Mantenimiento ─────────────────────────────────────────────

export async function createMaintenanceTask(data: MaintenanceFormData): Promise<string> {
  const id = generateId()
  const timestamp = now()
  await db.maintenanceTasks.add({
    ...data,
    id,
    completedDate: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  return id
}

export async function updateMaintenanceTask(id: string, data: Partial<MaintenanceFormData>): Promise<void> {
  const updates: Partial<MaintenanceTask> = {
    ...data,
    updatedAt: now(),
  }
  if (data.status === 'completed') {
    updates.completedDate = now()
  }
  await db.maintenanceTasks.update(id, updates)
}

export async function deleteMaintenanceTask(id: string): Promise<void> {
  await db.maintenanceTasks.delete(id)
}

// ── Usuarios ──────────────────────────────────────────────────

export async function createUser(data: UserFormData): Promise<string> {
  const id = generateId()
  const timestamp = now()
  await db.users.add({
    ...data,
    id,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  return id
}

export async function updateUser(id: string, data: Partial<UserFormData>): Promise<void> {
  await db.users.update(id, { ...data, updatedAt: now() })
}

export async function deleteUser(id: string): Promise<void> {
  await db.users.delete(id)
}

export { db }
