import { AlertTriangle } from 'lucide-react'
import { IncidentCard } from './IncidentCard'
import { EmptyState } from '../ui/EmptyState'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { Incident } from '../../types/models'

interface IncidentListProps {
  incidents: Incident[]
  isLoading: boolean
}

export function IncidentList({ incidents, isLoading }: IncidentListProps) {
  if (isLoading) return <LoadingSpinner />

  if (incidents.length === 0) {
    return (
      <EmptyState
        icon={<AlertTriangle size={48} />}
        title="Sin incidencias"
        description="No se encontraron incidencias. Crea una nueva para comenzar."
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  )
}
