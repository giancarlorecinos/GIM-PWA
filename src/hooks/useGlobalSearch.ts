import { useLiveQuery } from 'dexie-react-hooks'
import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { Incident, MaintenanceTask, User } from '../types/models'

export type SearchResult =
  | { type: 'incident'; item: Incident }
  | { type: 'maintenance'; item: MaintenanceTask }
  | { type: 'user'; item: User }

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300)

  const results = useLiveQuery(async () => {
    if (!debouncedQuery || debouncedQuery.length < 2) return []

    const q = debouncedQuery.toLowerCase()
    const results: SearchResult[] = []

    const incidents = await db.incidents.toArray()
    for (const item of incidents) {
      if (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.assignee.toLowerCase().includes(q)
      ) {
        results.push({ type: 'incident', item })
      }
    }

    const tasks = await db.maintenanceTasks.toArray()
    for (const item of tasks) {
      if (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.responsiblePerson.toLowerCase().includes(q)
      ) {
        results.push({ type: 'maintenance', item })
      }
    }

    const users = await db.users.toArray()
    for (const item of users) {
      if (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q)
      ) {
        results.push({ type: 'user', item })
      }
    }

    return results.slice(0, 10)
  }, [debouncedQuery])

  return { results: results ?? [], isSearching: results === undefined }
}
