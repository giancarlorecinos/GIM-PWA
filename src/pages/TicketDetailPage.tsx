import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { firestore } from '../firebase/config'
import { deleteTicket, updateTicket, claimTicket, unassignTicket, type Ticket } from '../firebase/firestore'
import { useAuthContext } from '../context/AuthContext'
import { TicketChat } from '../components/TicketChat'
import { getTicketTypeConfig } from '../lib/ticketTypes'

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

const statusLabels = {
  open: 'Abierto',
  'in-progress': 'En Progreso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
}

const priorityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, role } = useAuthContext()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [assigneeName, setAssigneeName] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getDoc(doc(firestore, 'tickets', id)).then((snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Ticket
        setTicket(data)
        if (data.assigned_to) {
          getDoc(doc(firestore, 'users', data.assigned_to)).then((u) => {
            setAssigneeName(u.exists() ? u.data().email : data.assigned_to)
          })
        }
        getDoc(doc(firestore, 'users', data.created_by)).then((u) => {
          setCreatorName(u.exists() ? u.data().email : data.created_by)
        })
      }
      setLoading(false)
    })
  }, [id])

  const handleStatusChange = async (newStatus: Ticket['status']) => {
    if (!id) return
    try {
      await updateTicket(id, { status: newStatus })
      setTicket((prev) => prev ? { ...prev, status: newStatus } : prev)
      toast.success(`Estado cambiado a ${statusLabels[newStatus]}`)
    } catch {
      toast.error('Error al actualizar estado')
    }
  }

  const handleClaim = async () => {
    if (!id || !user) return
    try {
      await claimTicket(id, user.uid)
      setTicket((prev) => prev ? { ...prev, assigned_to: user.uid, status: 'in-progress' } : prev)
      setAssigneeName(user.email)
      toast.success('Ticket reclamado')
    } catch {
      toast.error('Error al reclamar ticket')
    }
  }

  const handleRelease = async () => {
    if (!id) return
    try {
      await unassignTicket(id)
      setTicket((prev) => prev ? { ...prev, assigned_to: null, status: 'open' } : prev)
      setAssigneeName(null)
      toast.success('Ticket liberado a la cola')
    } catch {
      toast.error('Error al liberar ticket')
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Eliminar este ticket?')) return
    try {
      await deleteTicket(id)
      toast.success('Ticket eliminado')
      navigate('/tickets')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Ticket no encontrado</p>
        <button onClick={() => navigate('/tickets')} className="text-blue-400 text-sm mt-2 hover:underline">
          Volver a tickets
        </button>
      </div>
    )
  }

  const createdAt = ticket.createdAt && typeof ticket.createdAt === 'object' && 'toDate' in ticket.createdAt
    ? (ticket.createdAt as { toDate: () => Date }).toDate().toLocaleString('es-GT')
    : '—'

  const isAgent = role === 'agent'
  const isAdmin = role === 'admin'
  const isMyTicket = ticket.assigned_to === user?.uid
  const canClaim = (isAgent || isAdmin) && !ticket.assigned_to && ticket.status === 'open'
  const canRelease = (isAgent || isAdmin) && isMyTicket

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-400 hover:text-slate-200 mb-4 inline-block"
      >
        &larr; Volver
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        {(() => {
          const typeCfg = getTicketTypeConfig(ticket.ticketType)
          const TypeIcon = typeCfg.icon
          return (
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <TypeIcon size={20} className={typeCfg.badge.split(' ')[1]} />
                <h1 className="text-xl font-bold text-white truncate">{ticket.title}</h1>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded ${typeCfg.badge}`}>
                  {typeCfg.label}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${priorityColors[ticket.priority]}`}>
                  {priorityLabels[ticket.priority]}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[ticket.status]}`}>
                  {statusLabels[ticket.status]}
                </span>
              </div>
            </div>
          )
        })()}

        <div>
          <p className="text-xs text-slate-500 mb-1">Descripcion</p>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Creado</p>
            <p className="text-slate-300">{createdAt}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Creado por</p>
            <p className="text-slate-300 text-xs">{creatorName ?? ticket.created_by}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Asignado a</p>
            {ticket.assigned_to ? (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-xs">{assigneeName ?? ticket.assigned_to}</span>
                {canRelease && (
                  <button
                    onClick={handleRelease}
                    className="text-xs text-amber-400 hover:text-amber-300 underline"
                  >
                    Liberar
                  </button>
                )}
              </div>
            ) : (
              <span className="text-slate-500 text-xs">Sin asignar</span>
            )}
          </div>
        </div>

        {/* Claim button */}
        {canClaim && (
          <button
            onClick={handleClaim}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
          >
            Reclamar Ticket
          </button>
        )}

        {/* Status controls for agent/admin */}
        {(isAgent || isAdmin) && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Cambiar estado</p>
            <div className="flex gap-2 flex-wrap">
              {(['open', 'in-progress', 'resolved', 'closed'] as const).map((s) => (
                <button
                  key={s}
                  disabled={ticket.status === s}
                  onClick={() => handleStatusChange(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    ticket.status === s
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={handleDelete}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Eliminar ticket
            </button>
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="mt-6">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Conversacion</h2>
        <TicketChat ticketId={id!} isClosed={ticket.status === 'closed'} />
      </div>
    </div>
  )
}
