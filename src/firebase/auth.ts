import { useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, firestore } from './config'

export type UserRole = 'customer' | 'agent' | 'admin'

interface AuthState {
  user: User | null
  role: UserRole | null
  loading: boolean
}

async function fetchUserRole(uid: string): Promise<UserRole> {
  const snap = await getDoc(doc(firestore, 'users', uid))
  if (snap.exists()) return (snap.data().role as UserRole) ?? 'customer'
  return 'customer'
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await fetchUserRole(user.uid)
        setState({ user, role, loading: false })
      } else {
        setState({ user: null, role: null, loading: false })
      }
    })
    return unsubscribe
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const role = await fetchUserRole(cred.user.uid)
    setState({ user: cred.user, role, loading: false })
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
    setState({ user: null, role: null, loading: false })
  }, [])

  return { ...state, login, logout }
}
