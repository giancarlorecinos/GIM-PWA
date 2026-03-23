import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { ConfirmModal } from '../ui/ConfirmModal'
import { IncidentForm } from './IncidentForm'
import { deleteIncident } from '../../db/database'
import { formatDateTime } from '../../lib/utils'
import type { Incident } from '../../types/models'

interface IncidentDetailProps {
  incident: Incident
}

export function IncidentDetail({ incident }: IncidentDetailProps) {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleDelete() {
    await deleteIncident(incident.id)
    toast.success('Incidencia eliminada')
    navigate('/incidents')
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
          <ArrowLeft size={16} /> Volver
        </Button>
      </div>

      <Card className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">{incident.title}</h2>
            <div className="flex items-center gap-2">
              <Badge variant={incident.priority} />
              <Badge variant={incident.status} />
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
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{incident.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800 pt-4">
          <div>
            <p className="text-xs text-slate-500">Asignado a</p>
            <p className="text-sm text-slate-200">{incident.assignee}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Reportado por</p>
            <p className="text-sm text-slate-200">{incident.reporter}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Categoria</p>
            <p className="text-sm text-slate-200">{incident.category}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Ubicacion</p>
            <p className="text-sm text-slate-200">{incident.location || '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-800 pt-4">
          <div>
            <p className="text-xs text-slate-500">Creado</p>
            <p className="text-sm text-slate-200">{formatDateTime(incident.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Actualizado</p>
            <p className="text-sm text-slate-200">{formatDateTime(incident.updatedAt)}</p>
          </div>
          {incident.resolvedAt && (
            <div>
              <p className="text-xs text-slate-500">Resuelto</p>
              <p className="text-sm text-slate-200">{formatDateTime(incident.resolvedAt)}</p>
            </div>
          )}
        </div>

        {incident.resolutionNotes && (
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Notas de Resolucion</h3>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{incident.resolutionNotes}</p>
          </div>
        )}
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Incidencia">
        <IncidentForm incident={incident} onSuccess={() => setEditOpen(false)} />
      </Modal>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Incidencia"
        message="Esta accion no se puede deshacer. Se eliminara permanentemente esta incidencia."
      />
    </>
  )
}
