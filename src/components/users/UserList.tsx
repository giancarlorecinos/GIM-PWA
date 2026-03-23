import { Users } from 'lucide-react'
import { UserCard } from './UserCard'
import { EmptyState } from '../ui/EmptyState'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { User } from '../../types/models'

interface UserListProps {
  users: User[]
  isLoading: boolean
}

export function UserList({ users, isLoading }: UserListProps) {
  if (isLoading) return <LoadingSpinner />

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<Users size={48} />}
        title="Sin usuarios"
        description="No se encontraron usuarios. Crea uno nuevo para comenzar."
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
