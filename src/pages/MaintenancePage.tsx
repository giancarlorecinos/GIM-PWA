import { useState } from 'react'
import { Plus, List, CalendarDays } from 'lucide-react'
import { useMaintenanceTasks } from '../hooks/useMaintenanceTasks'
import { useMaintenanceStore } from '../stores/useMaintenanceStore'
import { MaintenanceList } from '../components/maintenance/MaintenanceList'
import { MaintenanceCalendar } from '../components/maintenance/MaintenanceCalendar'
import { MaintenanceFilters } from '../components/maintenance/MaintenanceFilters'
import { MaintenanceForm } from '../components/maintenance/MaintenanceForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/utils'

export default function MaintenancePage() {
  const { tasks, isLoading } = useMaintenanceTasks()
  const { viewMode, setViewMode } = useMaintenanceStore()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mantenimiento</h1>
          <p className="text-sm text-slate-400">{tasks.length} tarea(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <List size={14} /> Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                viewMode === 'calendar' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <CalendarDays size={14} /> Calendario
            </button>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Nueva Tarea
          </Button>
        </div>
      </div>

      <MaintenanceFilters />

      {viewMode === 'list' ? (
        <MaintenanceList tasks={tasks} isLoading={isLoading} />
      ) : (
        <MaintenanceCalendar tasks={tasks} />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva Tarea de Mantenimiento">
        <MaintenanceForm onSuccess={() => setCreateOpen(false)} />
      </Modal>
    </div>
  )
}
