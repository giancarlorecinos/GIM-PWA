import { useLiveQuery } from 'dexie-react-hooks'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { db } from '../../db/database'
import { Card } from '../ui/Card'

const COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#64748b',
}

const LABELS: Record<string, string> = {
  critical: 'Critico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
}

export function IncidentsByPriorityChart() {
  const data = useLiveQuery(async () => {
    const incidents = await db.incidents.toArray()
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    for (const inc of incidents) {
      counts[inc.priority] = (counts[inc.priority] || 0) + 1
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: LABELS[name], value, key: name }))
  })

  if (!data || data.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-medium text-slate-400 mb-4">Incidencias por Prioridad</h3>
        <p className="text-xs text-slate-500 text-center py-8">Sin datos</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-sm font-medium text-slate-400 mb-4">Incidencias por Prioridad</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
