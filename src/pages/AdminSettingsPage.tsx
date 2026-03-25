import { useState, type FormEvent } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'
import { firestore } from '../firebase/config'
import { useCategories, type Category } from '../hooks/useCategories'

export default function AdminSettingsPage() {
  const { categories, loading } = useCategories(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return

    setSubmitting(true)
    try {
      await addDoc(collection(firestore, 'categories'), { name, isActive: true, createdAt: serverTimestamp() })
      setNewName('')
      toast.success(`Categoria "${name}" creada`)
    } catch {
      toast.error('Error al crear categoria')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (cat: Category) => {
    try {
      await updateDoc(doc(firestore, 'categories', cat.id), { isActive: !cat.isActive })
      toast.success(cat.isActive ? `"${cat.name}" desactivada` : `"${cat.name}" activada`)
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const handleEditSave = async (id: string) => {
    const name = editName.trim()
    if (!name) return
    try {
      await updateDoc(doc(firestore, 'categories', id), { name })
      setEditingId(null)
      toast.success('Categoria actualizada')
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Eliminar "${cat.name}"? Los tickets existentes conservaran esta categoria.`)) return
    try {
      await deleteDoc(doc(firestore, 'categories', cat.id))
      toast.success(`"${cat.name}" eliminada`)
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Configuracion</h1>
        <p className="text-sm text-slate-400 mt-1">Gestiona las categorias de tickets</p>
      </div>

      {/* Add category */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoria..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newName.trim() || submitting}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Agregar
        </button>
      </form>

      {/* Category list */}
      {categories.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>Sin categorias. Agrega una para comenzar.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 last:border-0"
            >
              {editingId === cat.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditSave(cat.id)}
                  onBlur={() => handleEditSave(cat.id)}
                  autoFocus
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span
                  className={`flex-1 text-sm ${cat.isActive ? 'text-slate-200' : 'text-slate-600 line-through'}`}
                >
                  {cat.name}
                </span>
              )}

              <button
                onClick={() => startEdit(cat)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Editar
              </button>

              <button
                onClick={() => handleToggle(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  cat.isActive
                    ? 'border-emerald-800 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : 'border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat.isActive ? 'Activa' : 'Inactiva'}
              </button>

              <button
                onClick={() => handleDelete(cat)}
                className="text-xs text-red-500/60 hover:text-red-400 transition-colors"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
