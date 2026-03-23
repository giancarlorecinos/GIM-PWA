import { Wrench } from 'lucide-react'
import { MaintenanceCard } from './MaintenanceCard'
import { EmptyState } from '../ui/EmptyState'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { MaintenanceTask } from '../../types/models'

interface MaintenanceListProps {
  tasks: MaintenanceTask[]
  isLoading: boolean
}

export function MaintenanceList({ tasks, isLoading }: MaintenanceListProps) {
  if (isLoading) return <LoadingSpinner />

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<Wrench size={48} />}
        title="Sin tareas de mantenimiento"
        description="No se encontraron tareas. Crea una nueva para comenzar a planificar."
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <MaintenanceCard key={task.id} task={task} />
      ))}
    </div>
  )
}
