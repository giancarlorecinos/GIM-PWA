import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useMaintenanceStore } from '../stores/useMaintenanceStore'
import type { MaintenanceTask } from '../types/models'

export function useMaintenanceTasks() {
  const filters = useMaintenanceStore((s) => s.filters)

  const tasks = useLiveQuery(async () => {
    const all = await db.maintenanceTasks.orderBy('scheduledDate').toArray()

    return all.filter((item: MaintenanceTask) => {
      if (filters.status.length > 0 && !filters.status.includes(item.status)) return false
      if (filters.periodicity.length > 0 && !filters.periodicity.includes(item.periodicity)) return false
      if (filters.responsiblePerson && !item.responsiblePerson.toLowerCase().includes(filters.responsiblePerson.toLowerCase())) return false
      if (filters.category && item.category !== filters.category) return false
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        const match =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.responsiblePerson.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [filters])

  return { tasks: tasks ?? [], isLoading: tasks === undefined }
}

export function useMaintenanceTask(id: string | undefined) {
  const task = useLiveQuery(
    () => (id ? db.maintenanceTasks.get(id) : undefined),
    [id]
  )
  return { task, isLoading: task === undefined && id !== undefined }
}
