import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useIncidents } from '../hooks/useIncidents'
import { IncidentList } from '../components/incidents/IncidentList'
import { IncidentFilters } from '../components/incidents/IncidentFilters'
import { IncidentForm } from '../components/incidents/IncidentForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'

export default function IncidentsPage() {
  const { incidents, isLoading } = useIncidents()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Incidencias</h1>
          <p className="text-sm text-slate-400">{incidents.length} registro(s)</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Nueva Incidencia
        </Button>
      </div>

      <IncidentFilters />
      <IncidentList incidents={incidents} isLoading={isLoading} />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva Incidencia">
        <IncidentForm onSuccess={() => setCreateOpen(false)} />
      </Modal>
    </div>
  )
}
