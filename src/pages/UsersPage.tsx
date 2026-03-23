import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { UserList } from '../components/users/UserList'
import { UserFilters } from '../components/users/UserFilters'
import { UserForm } from '../components/users/UserForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'

export default function UsersPage() {
  const { users, isLoading } = useUsers()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-sm text-slate-400">{users.length} usuario(s)</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Nuevo Usuario
        </Button>
      </div>

      <UserFilters />
      <UserList users={users} isLoading={isLoading} />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo Usuario">
        <UserForm onSuccess={() => setCreateOpen(false)} />
      </Modal>
    </div>
  )
}
