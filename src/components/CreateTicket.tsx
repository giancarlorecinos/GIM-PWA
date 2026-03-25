import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthContext } from '../context/AuthContext'
import { createTicket } from '../firebase/firestore'
import { useCategories } from '../hooks/useCategories'
import { TICKET_TYPE_CONFIG, TICKET_TYPES, type TicketType } from '../lib/ticketTypes'

export function CreateTicket() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const { categories, loading: loadingCats } = useCategories(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    ticketType: '' as TicketType | '',
  })

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!form.title.trim()) {
      toast.error('El titulo es requerido')
      return
    }
    if (!form.description.trim()) {
      toast.error('La descripcion es requerida')
      return
    }
    if (!form.ticketType) {
      toast.error('Selecciona un tipo de solicitud')
      return
    }
    if (!form.category) {
      toast.error('Selecciona una categoria')
      return
    }

    const selectedCat = categories.find((c) => c.id === form.category)
    if (!selectedCat) {
      toast.error('Categoria invalida')
      return
    }

    setSubmitting(true)
    try {
      await createTicket(user.uid, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: selectedCat.name,
        categoryId: selectedCat.id,
        ticketType: form.ticketType,
      })
      toast.success('Ticket creado exitosamente')
      navigate('/tickets')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Nuevo Ticket</h1>
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Titulo</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe brevemente el problema"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Tipo de Solicitud</label>
          <select
            required
            value={form.ticketType}
            onChange={(e) => update('ticketType', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar tipo</option>
            {TICKET_TYPES.map((type) => (
              <option key={type} value={type}>
                {TICKET_TYPE_CONFIG[type].label} — {TICKET_TYPE_CONFIG[type].description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Descripcion</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Detalla el problema o solicitud"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Categoria</label>
          {loadingCats ? (
            <div className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-500">
              Cargando categorias...
            </div>
          ) : categories.length === 0 ? (
            <div className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-500">
              No hay categorias disponibles
            </div>
          ) : (
            <select
              required
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Prioridad</label>
          <select
            value={form.priority}
            onChange={(e) => update('priority', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
          >
            {submitting ? 'Creando...' : 'Crear Ticket'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
