import type { Ticket } from '../firebase/firestore'

const SLA_HOURS: Record<Ticket['priority'], number> = {
  critical: 2,
  high: 4,
  medium: 24,
  low: 48,
}

export type SlaStatus = 'green' | 'yellow' | 'red'

export interface SlaInfo {
  status: SlaStatus
  label: string
  remaining: string
}

function extractDate(timestamp: unknown): Date | null {
  if (!timestamp) return null
  if (typeof timestamp === 'object' && 'toDate' in (timestamp as Record<string, unknown>)) {
    return (timestamp as { toDate: () => Date }).toDate()
  }
  if (timestamp instanceof Date) return timestamp
  return null
}

function formatRemaining(ms: number): string {
  const abs = Math.abs(ms)
  const minutes = Math.floor(abs / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

export function getTicketSla(ticket: Ticket): SlaInfo | null {
  if (ticket.status === 'resolved' || ticket.status === 'closed') return null

  const created = extractDate(ticket.createdAt)
  if (!created) return null

  const slaHours = SLA_HOURS[ticket.priority]
  const deadlineMs = created.getTime() + slaHours * 3_600_000
  const now = Date.now()
  const totalMs = slaHours * 3_600_000
  const remainingMs = deadlineMs - now

  if (remainingMs <= 0) {
    return {
      status: 'red',
      label: 'SLA Vencido',
      remaining: `-${formatRemaining(remainingMs)}`,
    }
  }

  const percentRemaining = remainingMs / totalMs
  if (percentRemaining <= 0.25) {
    return {
      status: 'yellow',
      label: 'SLA En riesgo',
      remaining: formatRemaining(remainingMs),
    }
  }

  return {
    status: 'green',
    label: 'SLA OK',
    remaining: formatRemaining(remainingMs),
  }
}

export const SLA_STYLES: Record<SlaStatus, { dot: string; pill: string; border: string }> = {
  green: {
    dot: 'bg-emerald-400',
    pill: 'bg-emerald-500/20 text-emerald-400',
    border: 'border-l-emerald-500',
  },
  yellow: {
    dot: 'bg-amber-400',
    pill: 'bg-amber-500/20 text-amber-400',
    border: 'border-l-amber-500',
  },
  red: {
    dot: 'bg-red-400 animate-pulse',
    pill: 'bg-red-500/20 text-red-400',
    border: 'border-l-red-500',
  },
}
