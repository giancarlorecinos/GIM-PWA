import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, firestore } from '../firebase/config'

export type UserRole = 'customer' | 'agent' | 'admin'

interface AuthContextValue {
  user: User | null
  role: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

interface UserMeta {
  role: UserRole
  isActive: boolean
}

async function fetchUserMeta(uid: string): Promise<UserMeta> {
  const snap = await getDoc(doc(firestore, 'users', uid))
  if (!snap.exists()) return { role: 'customer', isActive: true }
  const data = snap.data()
  return { role: (data.role as UserRole) ?? 'customer', isActive: data.isActive !== false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const meta = await fetchUserMeta(firebaseUser.uid)
        if (!meta.isActive) {
          await signOut(auth)
          setUser(null)
          setRole(null)
          setLoading(false)
          return
        }
        setUser(firebaseUser)
        setRole(meta.role)
      } else {
        setUser(null)
        setRole(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const meta = await fetchUserMeta(cred.user.uid)
    if (!meta.isActive) {
      await signOut(auth)
      throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.')
    }
    setUser(cred.user)
    setRole(meta.role)
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(firestore, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: '',
      role: 'customer' as UserRole,
      isActive: true,
    })
    setUser(cred.user)
    setRole('customer')
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
    setUser(null)
    setRole(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
