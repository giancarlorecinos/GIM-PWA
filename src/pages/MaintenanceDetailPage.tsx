import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useMaintenanceTask } from '../hooks/useMaintenanceTasks'
import { deleteMaintenanceTask } from '../db/database'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { MaintenanceForm } from '../components/maintenance/MaintenanceForm'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatDate, formatDateTime } from '../lib/utils'

const periodicityLabels: Record<string, string> = {
  'one-time': 'Una vez',
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual',
}

export default function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { task, isLoading } = useMaintenanceTask(id)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) return <LoadingSpinner />
  if (!task) return <p className="text-slate-400 text-center py-16">Tarea no encontrada.</p>

  async function handleDelete() {
    await deleteMaintenanceTask(task!.id)
    toast.success('Tarea eliminada')
    navigate('/maintenance')
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/maintenance')}>
          <ArrowLeft size={16} /> Volver
        </Button>
      </div>

      <Card className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{task.title}</h2>
            <div className="flex items-center gap-2">
              <Badge variant={task.status} />
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {periodicityLabels[task.periodicity]}
              </span>
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

        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Descripcion</h3>
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{task.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800 pt-4">
          <div>
            <p className="text-xs text-slate-500">Responsable</p>
            <p className="text-sm text-slate-200">{task.responsiblePerson}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Fecha Programada</p>
            <p className="text-sm text-slate-200">{formatDate(task.scheduledDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Categoria</p>
            <p className="text-sm text-slate-200">{task.category}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Ubicacion</p>
            <p className="text-sm text-slate-200">{task.location || '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-800 pt-4">
          <div>
            <p className="text-xs text-slate-500">Creado</p>
            <p className="text-sm text-slate-200">{formatDateTime(task.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Actualizado</p>
            <p className="text-sm text-slate-200">{formatDateTime(task.updatedAt)}</p>
          </div>
          {task.completedDate && (
            <div>
              <p className="text-xs text-slate-500">Completado</p>
              <p className="text-sm text-slate-200">{formatDateTime(task.completedDate)}</p>
            </div>
          )}
        </div>

        {task.notes && (
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Notas</h3>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{task.notes}</p>
          </div>
        )}
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Tarea">
        <MaintenanceForm task={task} onSuccess={() => setEditOpen(false)} />
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Tarea"
        message="Esta accion no se puede deshacer. Se eliminara permanentemente esta tarea de mantenimiento."
      />
    </>
  )
}
