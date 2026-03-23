import { useNavigate } from 'react-router-dom'
import { Clock, User } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { timeAgo } from '../../lib/utils'
import type { Incident } from '../../types/models'

interface IncidentCardProps {
  incident: Incident
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer hover:border-slate-700 transition-colors"
      onClick={() => navigate(`/incidents/${incident.id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-medium text-white truncate flex-1">{incident.title}</h3>
        <Badge variant={incident.priority} />
      </div>
      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{incident.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User size={12} />
            {incident.assignee}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {timeAgo(incident.createdAt)}
          </span>
        </div>
        <Badge variant={incident.status} />
      </div>
    </Card>
  )
}
