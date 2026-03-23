import { useMaintenanceStore } from '../../stores/useMaintenanceStore'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { RotateCcw } from 'lucide-react'

const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in-progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'overdue', label: 'Vencido' },
]

const periodicityOptions = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
  { value: 'one-time', label: 'Una vez' },
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

export function MaintenanceFilters() {
  const { filters, setFilters, resetFilters } = useMaintenanceStore()

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
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
          label="Periodicidad"
          options={periodicityOptions}
          placeholder="Todas"
          value={filters.periodicity[0] || ''}
          onChange={(e) => setFilters({ periodicity: e.target.value ? [e.target.value as never] : [] })}
        />
      </div>
      <div className="w-40">
        <Select
          label="Categoria"
          options={categoryOptions}
          placeholder="Todas"
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
        />
      </div>
      <div className="w-48">
        <Input
          label="Buscar"
          placeholder="Titulo, responsable..."
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
