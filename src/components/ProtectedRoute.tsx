import { Navigate } from 'react-router-dom'
import { useAuthContext, type UserRole } from '../context/AuthContext'

interface ProtectedRouteProps {
  allowed: UserRole[]
  children: React.ReactNode
}

export function ProtectedRoute({ allowed, children }: ProtectedRouteProps) {
  const { role, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (!role || !allowed.includes(role)) {
    return <Navigate to={role === 'customer' ? '/tickets' : '/'} replace />
  }

  return <>{children}</>
}
