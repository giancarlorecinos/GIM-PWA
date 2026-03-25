import { Flame, ListTodo, HelpCircle, type LucideIcon } from 'lucide-react'

export type TicketType = 'incident' | 'service_request' | 'question'

export const TICKET_TYPE_CONFIG: Record<TicketType, {
  label: string
  description: string
  badge: string
  color: string
  icon: LucideIcon
}> = {
  incident: {
    label: 'Incidente',
    description: 'Algo esta roto o no funciona',
    badge: 'bg-red-500/20 text-red-400',
    color: '#ef4444',
    icon: Flame,
  },
  service_request: {
    label: 'Solicitud',
    description: 'Necesito algo nuevo o acceso',
    badge: 'bg-blue-500/20 text-blue-400',
    color: '#3b82f6',
    icon: ListTodo,
  },
  question: {
    label: 'Pregunta',
    description: 'Consulta general',
    badge: 'bg-violet-500/20 text-violet-400',
    color: '#8b5cf6',
    icon: HelpCircle,
  },
}

export const TICKET_TYPES = Object.keys(TICKET_TYPE_CONFIG) as TicketType[]

export function getTicketTypeConfig(type: string | undefined) {
  return TICKET_TYPE_CONFIG[(type as TicketType)] ?? TICKET_TYPE_CONFIG.incident
}
