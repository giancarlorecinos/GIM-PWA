import { cn } from '../../lib/utils'

type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'open' | 'in-progress' | 'resolved' | 'closed' | 'pending' | 'completed' | 'overdue'

const variantStyles: Record<BadgeVariant, string> = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-amber-500/20 text-amber-400',
  medium: 'bg-blue-500/20 text-blue-400',
  low: 'bg-slate-500/20 text-slate-400',
  open: 'bg-amber-500/20 text-amber-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-slate-500/20 text-slate-400',
  pending: 'bg-amber-500/20 text-amber-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  overdue: 'bg-red-500/20 text-red-400',
}

const labels: Record<BadgeVariant, string> = {
  critical: 'Critico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
  open: 'Abierto',
  'in-progress': 'En Progreso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
  pending: 'Pendiente',
  completed: 'Completado',
  overdue: 'Vencido',
}

interface BadgeProps {
  variant: BadgeVariant
  className?: string
}

export function Badge({ variant, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', variantStyles[variant], className)}>
      {labels[variant]}
    </span>
  )
}
