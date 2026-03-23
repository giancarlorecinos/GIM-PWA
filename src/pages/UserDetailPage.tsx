import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Trash2, Mail, Phone } from 'lucide-react'
import { useUser } from '../hooks/useUsers'
import { deleteUser } from '../db/database'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { UserForm } from '../components/users/UserForm'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatDateTime, cn } from '../lib/utils'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  technician: 'Tecnico',
  viewer: 'Visualizador',
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-500/20 text-purple-400',
  supervisor: 'bg-blue-500/20 text-blue-400',
  technician: 'bg-emerald-500/20 text-emerald-400',
  viewer: 'bg-slate-500/20 text-slate-400',
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isLoading } = useUser(id)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) return <LoadingSpinner />
  if (!user) return <p className="text-slate-400 text-center py-16">Usuario no encontrado.</p>

  async function handleDelete() {
    await deleteUser(user!.id)
    toast.success('Usuario eliminado')
    navigate('/users')
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
          <ArrowLeft size={16} /> Volver
        </Button>
      </div>

      <Card className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-blue-400">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', roleColors[user.role])}>
                  {roleLabels[user.role]}
                </span>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
                  user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                )}>
                  {user.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil size={14} /> Editar
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={14} /> Eliminar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800 pt-4">
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm text-slate-200 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Telefono</p>
            <p className="text-sm text-slate-200 flex items-center gap-1"><Phone size={12} /> {user.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Departamento</p>
            <p className="text-sm text-slate-200">{user.department}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Cargo</p>
            <p className="text-sm text-slate-200">{user.position || '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
          <div>
            <p className="text-xs text-slate-500">Creado</p>
            <p className="text-sm text-slate-200">{formatDateTime(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Actualizado</p>
            <p className="text-sm text-slate-200">{formatDateTime(user.updatedAt)}</p>
          </div>
        </div>

        {user.notes && (
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Notas</h3>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{user.notes}</p>
          </div>
        )}
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Usuario">
        <UserForm user={user} onSuccess={() => setEditOpen(false)} />
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message="Esta accion no se puede deshacer. Se eliminara permanentemente este usuario."
      />
    </>
  )
}
