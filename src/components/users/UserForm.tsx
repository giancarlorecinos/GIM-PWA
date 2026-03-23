import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { userSchema, type UserFormData } from '../../lib/validators'
import { createUser, updateUser } from '../../db/database'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import type { User } from '../../types/models'

interface UserFormProps {
  user?: User
  onSuccess: () => void
}

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'technician', label: 'Tecnico' },
  { value: 'viewer', label: 'Visualizador' },
]

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

const departmentOptions = [
  { value: 'Mantenimiento', label: 'Mantenimiento' },
  { value: 'IT', label: 'IT' },
  { value: 'Operaciones', label: 'Operaciones' },
  { value: 'Administracion', label: 'Administracion' },
  { value: 'Seguridad', label: 'Seguridad' },
  { value: 'Otro', label: 'Otro' },
]

export function UserForm({ user, onSuccess }: UserFormProps) {
  const isEdit = !!user
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          department: user.department,
          position: user.position,
          notes: user.notes,
        }
      : {
          role: 'technician',
          status: 'active',
          phone: '',
          position: '',
          notes: '',
        },
  })

  async function onSubmit(data: UserFormData) {
    if (isEdit) {
      await updateUser(user.id, data)
      toast.success('Usuario actualizado')
    } else {
      await createUser(data)
      toast.success('Usuario creado')
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nombre completo" {...register('name')} error={errors.name?.message} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Telefono" {...register('phone')} placeholder="Ej: +502 1234-5678" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Rol" options={roleOptions} {...register('role')} error={errors.role?.message} />
        <Select label="Estado" options={statusOptions} {...register('status')} error={errors.status?.message} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Departamento" options={departmentOptions} placeholder="Seleccionar..." {...register('department')} error={errors.department?.message} />
        <Input label="Cargo" {...register('position')} placeholder="Ej: Tecnico Senior" />
      </div>
      <Textarea label="Notas" {...register('notes')} placeholder="Observaciones adicionales..." />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Usuario'}
        </Button>
      </div>
    </form>
  )
}
