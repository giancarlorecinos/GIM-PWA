import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useIncidentStore } from '../stores/useIncidentStore'
import type { Incident } from '../types/models'

export function useIncidents() {
  const filters = useIncidentStore((s) => s.filters)

  const incidents = useLiveQuery(async () => {
    let collection = db.incidents.orderBy('createdAt')
    const all = await collection.reverse().toArray()

    return all.filter((item: Incident) => {
      if (filters.status.length > 0 && !filters.status.includes(item.status)) return false
      if (filters.priority.length > 0 && !filters.priority.includes(item.priority)) return false
      if (filters.assignee && !item.assignee.toLowerCase().includes(filters.assignee.toLowerCase())) return false
      if (filters.category && item.category !== filters.category) return false
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        const match =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.assignee.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [filters])

  return { incidents: incidents ?? [], isLoading: incidents === undefined }
}

export function useIncident(id: string | undefined) {
  const incident = useLiveQuery(
    () => (id ? db.incidents.get(id) : undefined),
    [id]
  )
  return { incident, isLoading: incident === undefined && id !== undefined }
}
