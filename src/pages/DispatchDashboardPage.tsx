import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, query, where, orderBy, onSnapshot, limit,
} from 'firebase/firestore'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { firestore } from '../firebase/config'
import { getTicketTypeConfig } from '../lib/ticketTypes'
import { getTicketSla, SLA_STYLES } from '../lib/sla'
import type { Ticket } from '../firebase/firestore'

/* ── colour maps ───────────────────────────────────────────── */

const PRIORITY_BORDER: Record<string, string> = {
  critical: 'border-red-500 shadow-red-500/25',
  high: 'border-red-500 shadow-red-500/25',
  medium: 'border-amber-500 shadow-amber-500/25',
  low: 'border-blue-500 shadow-blue-500/25',
}

const PRIORITY_RING: Record<string, string> = {
  critical: 'ring-red-500/40',
  high: 'ring-red-500/40',
  medium: 'ring-amber-500/40',
  low: 'ring-blue-500/40',
}

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

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

const CHART_TOOLTIP = {
  contentStyle: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#e2e8f0' },
}

/* ── helper: extract Firestore timestamp ────────────────────── */

function toDate(ts: unknown): Date | null {
  if (!ts) return null
  if (typeof ts === 'object' && 'toDate' in (ts as Record<string, unknown>))
    return (ts as { toDate: () => Date }).toDate()
  if (ts instanceof Date) return ts
  return null
}

function isToday(d: Date): boolean {
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

/* ── metric card ────────────────────────────────────────────── */

function MetricCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-600 mt-1">{sub}</p>}
    </div>
  )
}

/* ── live bubble ────────────────────────────────────────────── */

function TicketBubble({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const typeCfg = getTicketTypeConfig(ticket.ticketType)
  const TypeIcon = typeCfg.icon
  const sla = getTicketSla(ticket)
  const slaStyle = sla ? SLA_STYLES[sla.status] : null
  const borderCls = PRIORITY_BORDER[ticket.priority] ?? PRIORITY_BORDER.low
  const ringCls = PRIORITY_RING[ticket.priority] ?? PRIORITY_RING.low

  return (
    <button
      onClick={onClick}
      className={`relative group flex flex-col items-start gap-2 rounded-2xl border-2 bg-slate-900/80 backdrop-blur px-4 py-3 shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl cursor-pointer ${borderCls}`}
    >
      {/* ping ring */}
      <span className={`absolute -inset-px rounded-2xl ring-2 animate-ping opacity-20 pointer-events-none ${ringCls}`} />

      <div className="flex items-center gap-2 w-full">
        <TypeIcon size={14} className={typeCfg.badge.split(' ')[1]} />
        <span className="text-xs font-semibold text-slate-100 truncate max-w-[180px]">
          {ticket.title}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeCfg.badge}`}>
          {typeCfg.label}
        </span>
        <span className="text-[10px] text-slate-500">
          {PRIORITY_LABELS[ticket.priority]}
        </span>
        {sla && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${slaStyle!.pill}`}>
            <span className={`w-1 h-1 rounded-full ${slaStyle!.dot}`} />
            {sla.remaining}
          </span>
        )}
      </div>

      {ticket.category && (
        <span className="text-[10px] text-slate-600 truncate max-w-full">
          {ticket.category}
        </span>
      )}
    </button>
  )
}

/* ── main page ──────────────────────────────────────────────── */

export default function DispatchDashboardPage() {
  const navigate = useNavigate()
  const [openTickets, setOpenTickets] = useState<Ticket[]>([])
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [loadingOpen, setLoadingOpen] = useState(true)
  const [loadingAll, setLoadingAll] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* live listener — open tickets only */
  useEffect(() => {
    const q = query(
      collection(firestore, 'tickets'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setOpenTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ticket))
      setLoadingOpen(false)
    }, (err) => {
      console.error('Open tickets listener error:', err)
      if (err.message?.includes('index')) {
        setError('Firestore necesita un indice compuesto. Revisa la consola del navegador para el link de creacion.')
      }
      setLoadingOpen(false)
    })
    return unsub
  }, [])

  /* all tickets (capped at 200 for analytics) */
  useEffect(() => {
    const q = query(
      collection(firestore, 'tickets'),
      orderBy('createdAt', 'desc'),
      limit(200),
    )
    const unsub = onSnapshot(q, (snap) => {
      setAllTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ticket))
      setLoadingAll(false)
    }, (err) => {
      console.error('All tickets listener error:', err)
      setLoadingAll(false)
    })
    return unsub
  }, [])

  /* computed metrics */
  const metrics = useMemo(() => {
    const newToday = allTickets.filter((t) => {
      const d = toDate(t.createdAt)
      return d && isToday(d)
    }).length

    const unassigned = allTickets.filter(
      (t) => t.status === 'open' && !t.assigned_to,
    ).length

    const escalated = allTickets.filter(
      (t) => (t.priority === 'critical' || t.priority === 'high')
        && t.status !== 'resolved' && t.status !== 'closed',
    ).length

    /* avg resolution time (resolved/closed tickets with timestamps) */
    const resolved = allTickets.filter(
      (t) => t.status === 'resolved' || t.status === 'closed',
    )
    let avgResolution = '—'
    if (resolved.length > 0) {
      const diffs: number[] = []
      for (const t of resolved) {
        const created = toDate(t.createdAt)
        const updated = toDate(t.updatedAt)
        if (created && updated) diffs.push(updated.getTime() - created.getTime())
      }
      if (diffs.length > 0) {
        const avgMs = diffs.reduce((a, b) => a + b, 0) / diffs.length
        const hrs = Math.round(avgMs / 3_600_000)
        avgResolution = hrs < 1 ? '<1h' : `${hrs}h`
      }
    }

    /* by ticketType (donut) */
    const byType = Object.entries(
      allTickets.reduce<Record<string, number>>((acc, t) => {
        const type = t.ticketType ?? 'incident'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {}),
    ).map(([type, count]) => {
      const cfg = getTicketTypeConfig(type)
      return { name: cfg.label, value: count, color: cfg.color }
    })

    /* by status (bar) */
    const byStatus = Object.entries(
      allTickets.reduce<Record<string, number>>((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1
        return acc
      }, {}),
    ).map(([status, count]) => ({
      name: STATUS_LABELS[status] ?? status,
      value: count,
      fill: STATUS_COLORS[status] ?? '#64748b',
    }))

    return { newToday, unassigned, escalated, avgResolution, byType, byStatus }
  }, [allTickets])

  const loading = loadingOpen || loadingAll

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <p className="text-xs text-slate-500">
          Abre la consola del navegador (F12), copia el link que empieza con
          https://console.firebase.google.com/... y abrelo para crear el indice.
          Tarda 1-2 minutos. Luego recarga la pagina.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-white">Dispatch Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Radar en vivo y metricas operativas
        </p>
      </div>

      {/* ── metric cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Nuevos Hoy" value={metrics.newToday} color="text-blue-400" />
        <MetricCard
          label="Tiempo Resolucion Prom."
          value={metrics.avgResolution}
          sub="creacion → resolucion"
          color="text-emerald-400"
        />
        <MetricCard label="Sin Asignar" value={metrics.unassigned} color="text-amber-400" />
        <MetricCard
          label="Escalados"
          value={metrics.escalated}
          sub="alta + critica activos"
          color="text-red-400"
        />
      </div>

      {/* ── live radar ─────────────────────────────────────── */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h2 className="text-sm font-semibold text-white">
            Radar en Vivo
          </h2>
          <span className="text-xs text-slate-500">
            {openTickets.length} ticket{openTickets.length !== 1 ? 's' : ''} abierto{openTickets.length !== 1 ? 's' : ''}
          </span>
        </div>

        {openTickets.length === 0 ? (
          <div className="text-center py-10 text-slate-600">
            <p className="text-sm">Sin tickets abiertos — todo en orden</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {openTickets.map((ticket) => (
              <TicketBubble
                key={ticket.id}
                ticket={ticket}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── charts ─────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Donut — by ticket type */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-400 mb-4">
            Tickets por Tipo
          </h3>
          {metrics.byType.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-8">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={metrics.byType}
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
                  {metrics.byType.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar — by status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-400 mb-4">
            Tickets por Estado
          </h3>
          {metrics.byStatus.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-8">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={metrics.byStatus} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Tickets">
                  {metrics.byStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
