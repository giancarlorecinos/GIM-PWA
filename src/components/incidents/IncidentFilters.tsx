import { useIncidentStore } from '../../stores/useIncidentStore'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { RotateCcw } from 'lucide-react'

const statusOptions = [
  { value: 'open', label: 'Abierto' },
  { value: 'in-progress', label: 'En Progreso' },
  { value: 'resolved', label: 'Resuelto' },
  { value: 'closed', label: 'Cerrado' },
]

const priorityOptions = [
  { value: 'critical', label: 'Critico' },
  { value: 'high', label: 'Alto' },
  { value: 'medium', label: 'Medio' },
  { value: 'low', label: 'Bajo' },
]

const categoryOptions = [
  { value: 'Electrico', label: 'Electrico' },
  { value: 'Plomeria', label: 'Plomeria' },
  { value: 'IT', label: 'IT' },
  { value: 'Mecanico', label: 'Mecanico' },
  { value: 'Infraestructura', label: 'Infraestructura' },
  { value: 'Otro', label: 'Otro' },
]

export function IncidentFilters() {
  const { filters, setFilters, resetFilters } = useIncidentStore()

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
          label="Prioridad"
          options={priorityOptions}
          placeholder="Todas"
          value={filters.priority[0] || ''}
          onChange={(e) => setFilters({ priority: e.target.value ? [e.target.value as never] : [] })}
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
          placeholder="Titulo, asignado..."
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
