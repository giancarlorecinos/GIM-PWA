import { useNavigate } from 'react-router-dom'
import { Mail, Building } from 'lucide-react'
import { Card } from '../ui/Card'
import { cn } from '../../lib/utils'
import type { User } from '../../types/models'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  technician: 'Tecnico',
  viewer: 'Visualizador',
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-500/20 text-purple-400',
  supervisor: 'bg-blue-500/20 text-blue-400',
  technician: 'bg-emerald-500/20 text-emerald-400',
  viewer: 'bg-slate-500/20 text-slate-400',
}

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer hover:border-slate-700 transition-colors"
      onClick={() => navigate(`/users/${user.id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold text-blue-400">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">{user.name}</h3>
            <p className="text-xs text-slate-500">{user.position || user.department}</p>
          </div>
        </div>
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
          user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
        )}>
          {user.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Mail size={12} />
            {user.email}
          </span>
          <span className="flex items-center gap-1">
            <Building size={12} />
            {user.department}
          </span>
        </div>
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', roleColors[user.role])}>
          {roleLabels[user.role]}
        </span>
      </div>
    </Card>
  )
}
