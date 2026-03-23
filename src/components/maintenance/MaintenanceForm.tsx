import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { maintenanceSchema, type MaintenanceFormData } from '../../lib/validators'
import { createMaintenanceTask, updateMaintenanceTask } from '../../db/database'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import type { MaintenanceTask } from '../../types/models'

interface MaintenanceFormProps {
  task?: MaintenanceTask
  onSuccess: () => void
}

const periodicityOptions = [
  { value: 'one-time', label: 'Una vez' },
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
]

const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in-progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'overdue', label: 'Vencido' },
]

const categoryOptions = [
  { value: 'Electrico', label: 'Electrico' },
  { value: 'Plomeria', label: 'Plomeria' },
  { value: 'IT', label: 'IT' },
  { value: 'Mecanico', label: 'Mecanico' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'Limpieza', label: 'Limpieza' },
  { value: 'Otro', label: 'Otro' },
]

export function MaintenanceForm({ task, onSuccess }: MaintenanceFormProps) {
  const isEdit = !!task
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          responsiblePerson: task.responsiblePerson,
          scheduledDate: task.scheduledDate.split('T')[0],
          periodicity: task.periodicity,
          status: task.status,
          category: task.category,
          location: task.location,
          notes: task.notes,
        }
      : {
          periodicity: 'monthly',
          status: 'pending',
          notes: '',
          location: '',
        },
  })

  async function onSubmit(data: MaintenanceFormData) {
    if (isEdit) {
      await updateMaintenanceTask(task.id, data)
      toast.success('Tarea actualizada')
    } else {
      await createMaintenanceTask(data)
      toast.success('Tarea creada')
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Titulo" {...register('title')} error={errors.title?.message} />
      <Textarea label="Descripcion" {...register('description')} error={errors.description?.message} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Responsable" {...register('responsiblePerson')} error={errors.responsiblePerson?.message} />
        <Input label="Fecha Programada" type="date" {...register('scheduledDate')} error={errors.scheduledDate?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Periodicidad" options={periodicityOptions} {...register('periodicity')} error={errors.periodicity?.message} />
        <Select label="Estado" options={statusOptions} {...register('status')} error={errors.status?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Categoria" options={categoryOptions} placeholder="Seleccionar..." {...register('category')} error={errors.category?.message} />
        <Input label="Ubicacion" {...register('location')} placeholder="Ej: Edificio B, Sala 2" />
      </div>

      <Textarea label="Notas" {...register('notes')} placeholder="Observaciones adicionales..." />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Tarea'}
        </Button>
      </div>
    </form>
  )
}
