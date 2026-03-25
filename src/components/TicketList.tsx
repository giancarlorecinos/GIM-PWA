import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useTickets } from '../hooks/useTickets'
import { getTicketTypeConfig, TICKET_TYPES, TICKET_TYPE_CONFIG, type TicketType } from '../lib/ticketTypes'
import { getTicketSla, SLA_STYLES } from '../lib/sla'

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

export function TicketList() {
  const { user, role } = useAuthContext()
  const { tickets, loading } = useTickets(role, user?.uid ?? null)
  const navigate = useNavigate()
  const [filterType, setFilterType] = useState<TicketType | ''>('')

  const filtered = useMemo(
    () => filterType ? tickets.filter((t) => (t.ticketType ?? 'incident') === filterType) : tickets,
    [tickets, filterType],
  )

  const heading =
    role === 'agent' ? 'Tickets Abiertos y Asignados' :
    role === 'admin' ? 'Todos los Tickets' :
    'Mis Tickets'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{heading}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {role === 'agent' && 'Tickets abiertos o asignados a ti'}
            {role === 'customer' && 'Tickets creados por ti'}
            {role === 'admin' && 'Vista completa de todos los tickets'}
          </p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
        >
          + Nuevo Ticket
        </button>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap mb-4">
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">Sin tickets</p>
          <p className="text-sm mt-1">Crea un ticket para comenzar</p>
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
                className={`bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-slate-700 transition-colors cursor-pointer border-l-[3px] ${slaStyle?.border ?? 'border-l-slate-800'}`}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
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
