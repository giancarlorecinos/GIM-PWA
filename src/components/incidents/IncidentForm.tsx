import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { incidentSchema, type IncidentFormData } from '../../lib/validators'
import { createIncident, updateIncident } from '../../db/database'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import type { Incident } from '../../types/models'

interface IncidentFormProps {
  incident?: Incident
  onSuccess: () => void
}

const priorityOptions = [
  { value: 'critical', label: 'Critico' },
  { value: 'high', label: 'Alto' },
  { value: 'medium', label: 'Medio' },
  { value: 'low', label: 'Bajo' },
]

const statusOptions = [
  { value: 'open', label: 'Abierto' },
  { value: 'in-progress', label: 'En Progreso' },
  { value: 'resolved', label: 'Resuelto' },
  { value: 'closed', label: 'Cerrado' },
]

const categoryOptions = [
  { value: 'Electrico', label: 'Electrico' },
  { value: 'Plomeria', label: 'Plomeria' },
  { value: 'IT', label: 'IT' },
  { value: 'Mecanico', label: 'Mecanico' },
  { value: 'Infraestructura', label: 'Infraestructura' },
  { value: 'Otro', label: 'Otro' },
]

export function IncidentForm({ incident, onSuccess }: IncidentFormProps) {
  const isEdit = !!incident
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: incident
      ? {
          title: incident.title,
          description: incident.description,
          priority: incident.priority,
          status: incident.status,
          assignee: incident.assignee,
          reporter: incident.reporter,
          location: incident.location,
          category: incident.category,
          resolutionNotes: incident.resolutionNotes,
        }
      : {
          priority: 'medium',
          status: 'open',
          resolutionNotes: '',
          location: '',
        },
  })

  async function onSubmit(data: IncidentFormData) {
    if (isEdit) {
      await updateIncident(incident.id, data)
      toast.success('Incidencia actualizada')
    } else {
      await createIncident(data)
      toast.success('Incidencia creada')
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Titulo" {...register('title')} error={errors.title?.message} />
      <Textarea label="Descripcion" {...register('description')} error={errors.description?.message} />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Prioridad" options={priorityOptions} {...register('priority')} error={errors.priority?.message} />
        <Select label="Estado" options={statusOptions} {...register('status')} error={errors.status?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Asignado a" {...register('assignee')} error={errors.assignee?.message} />
        <Input label="Reportado por" {...register('reporter')} error={errors.reporter?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Categoria" options={categoryOptions} placeholder="Seleccionar..." {...register('category')} error={errors.category?.message} />
        <Input label="Ubicacion" {...register('location')} placeholder="Ej: Edificio A, Piso 3" />
      </div>

      <Textarea label="Notas de resolucion" {...register('resolutionNotes')} placeholder="Descripcion de la solucion aplicada..." />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Incidencia'}
        </Button>
      </div>
    </form>
  )
}
