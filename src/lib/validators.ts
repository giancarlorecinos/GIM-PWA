import { z } from 'zod'

export const incidentSchema = z.object({
  title: z.string().min(1, 'El titulo es requerido'),
  description: z.string().min(1, 'La descripcion es requerida'),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
  assignee: z.string().min(1, 'El responsable es requerido'),
  reporter: z.string().min(1, 'El reportador es requerido'),
  location: z.string(),
  category: z.string().min(1, 'La categoria es requerida'),
  resolutionNotes: z.string(),
})

export type IncidentFormData = z.infer<typeof incidentSchema>

export const maintenanceSchema = z.object({
  title: z.string().min(1, 'El titulo es requerido'),
  description: z.string().min(1, 'La descripcion es requerida'),
  responsiblePerson: z.string().min(1, 'El responsable es requerido'),
  scheduledDate: z.string().min(1, 'La fecha programada es requerida'),
  periodicity: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'one-time']),
  status: z.enum(['pending', 'in-progress', 'completed', 'overdue']),
  category: z.string().min(1, 'La categoria es requerida'),
  location: z.string(),
  notes: z.string(),
})

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>

export const userSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email invalido'),
  phone: z.string(),
  role: z.enum(['admin', 'technician', 'supervisor', 'viewer']),
  status: z.enum(['active', 'inactive']),
  department: z.string().min(1, 'El departamento es requerido'),
  position: z.string(),
  notes: z.string(),
})

export type UserFormData = z.infer<typeof userSchema>
