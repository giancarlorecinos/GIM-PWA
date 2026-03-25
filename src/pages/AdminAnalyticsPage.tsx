import { useState, useEffect, useMemo } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { firestore } from '../firebase/config'
import { TICKET_TYPE_CONFIG } from '../lib/ticketTypes'
import type { Ticket } from '../firebase/firestore'

const STATUS_COLORS: Record<string, string> = {
  open: '#3b82f6',
  'in-progress': '#f59e0b',
  resolved: '#10b981',
  closed: '#64748b',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  'in-progress': 'En Progreso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#64748b',
  critical: '#dc2626',
}

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

interface MetricCardProps {
  label: string
  value: number
  color: string
}

function MetricCard({ label, value, color }: MetricCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'tickets'), (snap) => {
      setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ticket))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const metrics = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter((t) => t.status === 'open').length
    const assigned = tickets.filter((t) => t.assigned_to !== null).length
    const resolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length

    const byStatus = Object.entries(
      tickets.reduce<Record<string, number>>((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1
        return acc
      }, {}),
    ).map(([status, count]) => ({
      name: STATUS_LABELS[status] ?? status,
      value: count,
      fill: STATUS_COLORS[status] ?? '#64748b',
    }))

    const byPriority = Object.entries(
      tickets.reduce<Record<string, number>>((acc, t) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1
        return acc
      }, {}),
    ).map(([priority, count]) => ({
      name: PRIORITY_LABELS[priority] ?? priority,
      value: count,
      color: PRIORITY_COLORS[priority] ?? '#64748b',
    }))

    const byType = Object.entries(
      tickets.reduce<Record<string, number>>((acc, t) => {
        const type = t.ticketType ?? 'incident'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {}),
    ).map(([type, count]) => ({
      name: TICKET_TYPE_CONFIG[type as keyof typeof TICKET_TYPE_CONFIG]?.label ?? type,
      value: count,
      color: TICKET_TYPE_CONFIG[type as keyof typeof TICKET_TYPE_CONFIG]?.color ?? '#64748b',
    }))

    return { total, open, assigned, resolved, byStatus, byPriority, byType }
  }, [tickets])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Vista global de todos los tickets del sistema</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Tickets" value={metrics.total} color="text-white" />
        <MetricCard label="Abiertos" value={metrics.open} color="text-blue-400" />
        <MetricCard label="Asignados" value={metrics.assigned} color="text-amber-400" />
        <MetricCard label="Resueltos" value={metrics.resolved} color="text-emerald-400" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart — Tickets by Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Tickets por Estado</h3>
          {metrics.byStatus.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-8">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={metrics.byStatus} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Tickets">
                  {metrics.byStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart — Tickets by Priority */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Tickets por Prioridad</h3>
          {metrics.byPriority.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-8">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={metrics.byPriority}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  strokeWidth={0}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {metrics.byPriority.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tickets by Type */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mt-6">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Tickets por Tipo (ITIL)</h3>
        {metrics.byType.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-8">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics.byType} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Tickets">
                {metrics.byType.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
