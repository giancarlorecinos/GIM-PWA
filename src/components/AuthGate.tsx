import { useState, type FormEvent } from 'react'
import { useAuthContext } from '../context/AuthContext'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, role, loading, signIn, signUp, logout } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (user) {
    return (
      <>
        <div className="fixed top-0 right-0 z-50 m-3 flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
          <span className="text-slate-400">{user.email}</span>
          <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-medium">{role}</span>
          <button onClick={logout} className="text-red-400 hover:text-red-300">Salir</button>
        </div>
        {children}
      </>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isRegister) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticacion')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4"
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-extrabold tracking-tight"><span className="text-blue-500">Zyn</span><span className="text-white">cro</span></h1>
        </div>
        <h2 className="text-sm text-slate-400 text-center">
          {isRegister ? 'Create your Zyncro account' : 'Sign in to Zyncro'}
        </h2>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Contrasena</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
        >
          {submitting ? 'Cargando...' : isRegister ? 'Registrarse' : 'Iniciar Sesion'}
        </button>

        <button
          type="button"
          onClick={() => { setIsRegister(!isRegister); setError(null) }}
          className="w-full text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          {isRegister ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
        </button>
      </form>
    </div>
  )
}
