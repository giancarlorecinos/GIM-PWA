import { useParams } from 'react-router-dom'
import { useIncident } from '../hooks/useIncidents'
import { IncidentDetail } from '../components/incidents/IncidentDetail'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { incident, isLoading } = useIncident(id)

  if (isLoading) return <LoadingSpinner />
  if (!incident) return <p className="text-slate-400 text-center py-16">Incidencia no encontrada.</p>

  return <IncidentDetail incident={incident} />
}
