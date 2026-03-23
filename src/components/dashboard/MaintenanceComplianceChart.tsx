import { useLiveQuery } from 'dexie-react-hooks'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { db } from '../../db/database'
import { Card } from '../ui/Card'

const LABELS: Record<string, string> = {
  pending: 'Pendiente',
  'in-progress': 'En Progreso',
  completed: 'Completado',
  overdue: 'Vencido',
}

const COLORS: Record<string, string> = {
  pending: '#f59e0b',
  'in-progress': '#3b82f6',
  completed: '#10b981',
  overdue: '#ef4444',
}

export function MaintenanceComplianceChart() {
  const data = useLiveQuery(async () => {
    const tasks = await db.maintenanceTasks.toArray()
    const counts: Record<string, number> = { pending: 0, 'in-progress': 0, completed: 0, overdue: 0 }
    for (const t of tasks) {
      counts[t.status] = (counts[t.status] || 0) + 1
    }
    return Object.entries(counts).map(([key, value]) => ({
      name: LABELS[key],
      value,
      fill: COLORS[key],
    }))
  })

  if (!data || data.every((d) => d.value === 0)) {
    return (
      <Card>
        <h3 className="text-sm font-medium text-slate-400 mb-4">Cumplimiento de Mantenimiento</h3>
        <p className="text-xs text-slate-500 text-center py-8">Sin datos</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-sm font-medium text-slate-400 mb-4">Cumplimiento de Mantenimiento</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
