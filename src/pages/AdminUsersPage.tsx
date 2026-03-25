import { useState, useEffect, useMemo } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { toast } from 'sonner'
import { firestore } from '../firebase/config'
import { changeUserRole, updateUserStatus } from '../firebase/firestore'
import { useAuthContext } from '../context/AuthContext'

interface FirestoreUser {
  uid: string
  email: string
  displayName?: string
  role: string
  isActive?: boolean
}

const ROLES = ['customer', 'agent', 'admin'] as const

const roleBadge: Record<string, string> = {
  admin: 'bg-purple-500/20 text-purple-400',
  agent: 'bg-blue-500/20 text-blue-400',
  customer: 'bg-slate-500/20 text-slate-400',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  agent: 'Agente',
  customer: 'Cliente',
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthContext()
  const [users, setUsers] = useState<FirestoreUser[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as FirestoreUser))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const sorted = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email)),
    [users],
  )

  const isSelf = (uid: string) => uid === currentUser?.uid

  const handleRoleChange = async (uid: string, newRole: string) => {
    if (isSelf(uid)) {
      toast.error('No puedes cambiar tu propio rol')
      return
    }
    setUpdating(uid)
    try {
      await changeUserRole(uid, newRole)
      toast.success(`Rol cambiado a ${roleLabels[newRole] ?? newRole}`)
    } catch {
      toast.error('Error al cambiar rol')
    } finally {
      setUpdating(null)
    }
  }

  const handleToggleActive = async (u: FirestoreUser) => {
    if (isSelf(u.uid)) {
      toast.error('No puedes desactivar tu propia cuenta')
      return
    }
    const newStatus = !(u.isActive !== false)
    setUpdating(u.uid)
    try {
      await updateUserStatus(u.uid, newStatus)
      toast.success(newStatus ? `"${u.email}" activado` : `"${u.email}" desactivado`)
    } catch {
      toast.error('Error al actualizar estado')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Gestion de Usuarios</h1>
        <p className="text-sm text-slate-400 mt-1">
          Administra roles y estado de los usuarios del sistema
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>Sin usuarios registrados</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Rol</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Estado</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => {
                const active = u.isActive !== false
                const self = isSelf(u.uid)
                return (
                  <tr
                    key={u.uid}
                    className={`border-b border-slate-800/50 hover:bg-slate-800/30 ${!active ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200">{u.email}</span>
                        {self && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">
                            Tu
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {u.displayName || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {self ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${roleBadge[u.role] ?? roleBadge.customer}`}>
                          {roleLabels[u.role] ?? u.role}
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={updating === u.uid}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                          className="text-xs rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {roleLabels[r]}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          active
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {self ? (
                        <span className="text-xs text-slate-600">—</span>
                      ) : (
                        <button
                          disabled={updating === u.uid}
                          onClick={() => handleToggleActive(u)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                            active
                              ? 'border-red-800 text-red-400 hover:bg-red-500/10'
                              : 'border-emerald-800 text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {updating === u.uid
                            ? 'Actualizando...'
                            : active
                              ? 'Desactivar'
                              : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
