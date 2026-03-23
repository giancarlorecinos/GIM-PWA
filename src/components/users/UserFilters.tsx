import { useUserStore } from '../../stores/useUserStore'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { RotateCcw } from 'lucide-react'

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

export function UserFilters() {
  const { filters, setFilters, resetFilters } = useUserStore()

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <div className="w-40">
        <Select
          label="Rol"
          options={roleOptions}
          placeholder="Todos"
          value={filters.role[0] || ''}
          onChange={(e) => setFilters({ role: e.target.value ? [e.target.value as never] : [] })}
        />
      </div>
      <div className="w-40">
        <Select
          label="Estado"
          options={statusOptions}
          placeholder="Todos"
          value={filters.status[0] || ''}
          onChange={(e) => setFilters({ status: e.target.value ? [e.target.value as never] : [] })}
        />
      </div>
      <div className="w-40">
        <Select
          label="Departamento"
          options={departmentOptions}
          placeholder="Todos"
          value={filters.department}
          onChange={(e) => setFilters({ department: e.target.value })}
        />
      </div>
      <div className="w-48">
        <Input
          label="Buscar"
          placeholder="Nombre, email..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
        />
      </div>
      <Button variant="ghost" size="sm" onClick={resetFilters}>
        <RotateCcw size={14} /> Limpiar
      </Button>
    </div>
  )
}
