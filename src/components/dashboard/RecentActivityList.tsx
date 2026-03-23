import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Wrench } from 'lucide-react'
import { db } from '../../db/database'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { timeAgo } from '../../lib/utils'

export function RecentActivityList() {
  const navigate = useNavigate()

  const items = useLiveQuery(async () => {
    const allIncidents = await db.incidents.toArray()
    const incidents = allIncidents.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)
    const allTasks = await db.maintenanceTasks.toArray()
    const tasks = allTasks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)

    const combined = [
      ...incidents.map((i) => ({ type: 'incident' as const, id: i.id, title: i.title, status: i.status, updatedAt: i.updatedAt })),
      ...tasks.map((t) => ({ type: 'maintenance' as const, id: t.id, title: t.title, status: t.status, updatedAt: t.updatedAt })),
    ]

    return combined.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)
  })

  return (
    <Card>
      <h3 className="text-sm font-medium text-slate-400 mb-4">Actividad Reciente</h3>
      {!items || items.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-8">Sin actividad reciente</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.type === 'incident' ? `/incidents/${item.id}` : `/maintenance/${item.id}`)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              {item.type === 'incident' ? (
                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              ) : (
                <Wrench size={14} className="text-emerald-400 shrink-0" />
              )}
              <span className="text-sm text-slate-200 truncate flex-1">{item.title}</span>
              <Badge variant={item.status as never} />
              <span className="text-xs text-slate-500 shrink-0">{timeAgo(item.updatedAt)}</span>
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}
