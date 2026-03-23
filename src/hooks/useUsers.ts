import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useUserStore } from '../stores/useUserStore'
import type { User } from '../types/models'

export function useUsers() {
  const filters = useUserStore((s) => s.filters)

  const users = useLiveQuery(async () => {
    const all = await db.users.orderBy('createdAt').reverse().toArray()

    return all.filter((item: User) => {
      if (filters.role.length > 0 && !filters.role.includes(item.role)) return false
      if (filters.status.length > 0 && !filters.status.includes(item.status)) return false
      if (filters.department && item.department !== filters.department) return false
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        const match =
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [filters])

  return { users: users ?? [], isLoading: users === undefined }
}

export function useUser(id: string | undefined) {
  const user = useLiveQuery(
    () => (id ? db.users.get(id) : undefined),
    [id]
  )
  return { user, isLoading: user === undefined && id !== undefined }
}
