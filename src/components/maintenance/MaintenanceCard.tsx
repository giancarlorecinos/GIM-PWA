import { useNavigate } from 'react-router-dom'
import { Calendar, User } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { formatDate } from '../../lib/utils'
import type { MaintenanceTask } from '../../types/models'

const periodicityLabels: Record<string, string> = {
  'one-time': 'Una vez',
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual',
}

interface MaintenanceCardProps {
  task: MaintenanceTask
}

export function MaintenanceCard({ task }: MaintenanceCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer hover:border-slate-700 transition-colors"
      onClick={() => navigate(`/maintenance/${task.id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-medium text-white truncate flex-1">{task.title}</h3>
        <Badge variant={task.status} />
      </div>
      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{task.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User size={12} />
            {task.responsiblePerson}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(task.scheduledDate)}
          </span>
        </div>
        <span className="text-xs text-slate-500">{periodicityLabels[task.periodicity]}</span>
      </div>
    </Card>
  )
}
