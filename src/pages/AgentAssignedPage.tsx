import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { firestore } from '../firebase/config'
import { useAuthContext } from '../context/AuthContext'
import { useCategories } from '../hooks/useCategories'
import { getTicketTypeConfig, TICKET_TYPES, TICKET_TYPE_CONFIG, type TicketType } from '../lib/ticketTypes'
import { getTicketSla, SLA_STYLES } from '../lib/sla'
import type { Ticket } from '../firebase/firestore'

const priorityColors = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-slate-500/20 text-slate-400',
  critical: 'bg-red-600/20 text-red-300',
}

const statusColors = {
  open: 'bg-blue-500/20 text-blue-400',
  'in-progress': 'bg-amber-500/20 text-amber-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-slate-500/20 text-slate-400',
}

export default function AgentAssignedPage() {
  const { user } = useAuthContext()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('')
  const [filterType, setFilterType] = useState<TicketType | ''>('')
  const { categories } = useCategories(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(firestore, 'tickets'),
      where('assigned_to', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )
    const unsubscribe = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ticket))
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  const filtered = useMemo(() => {
    let result = tickets
    if (filterType) result = result.filter((t) => (t.ticketType ?? 'incident') === filterType)
    if (filterCat) result = result.filter((t) => t.category === filterCat)
    return result
  }, [tickets, filterCat, filterType])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Mis Tickets Asignados</h1>
        <p className="text-sm text-slate-400 mt-1">Tickets asignados a ti para resolver</p>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap mb-3">
        <button
          onClick={() => setFilterType('')}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            !filterType
              ? 'border-blue-500 bg-blue-500/20 text-blue-400'
              : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
          }`}
        >
          Todos
        </button>
        {TICKET_TYPES.map((type) => {
          const cfg = TICKET_TYPE_CONFIG[type]
          const Icon = cfg.icon
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                filterType === type
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <Icon size={12} />
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setFilterCat('')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              !filterCat
                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.name)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                filterCat === cat.name
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">Sin asignaciones</p>
          <p className="text-sm mt-1">{filterCat ? `Sin tickets en "${filterCat}"` : 'No tienes tickets asignados'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => {
            const typeCfg = getTicketTypeConfig(ticket.ticketType)
            const TypeIcon = typeCfg.icon
            const sla = getTicketSla(ticket)
            const slaStyle = sla ? SLA_STYLES[sla.status] : null
            return (
              <div
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className={`bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-slate-700 transition-colors cursor-pointer border-l-[3px] ${slaStyle?.border ?? 'border-l-slate-800'}`}
              >
                <TypeIcon size={16} className={typeCfg.badge.split(' ')[1]} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{ticket.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{ticket.description}</p>
                </div>
                {sla && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1.5 ${slaStyle!.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${slaStyle!.dot}`} />
                    {sla.remaining}
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeCfg.badge}`}>
                  {typeCfg.label}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityColors[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[ticket.status]}`}>
                  {ticket.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
