import { useState, useEffect } from 'react'
import { subscribeToTickets, type Ticket, type UserRole } from '../firebase'

export function useTickets(role: UserRole | null, uid: string | null) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!role || !uid) {
      setTickets([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToTickets(role, uid, (data) => {
      setTickets(data)
      setLoading(false)
    })

    return unsubscribe
  }, [role, uid])

  return { tickets, loading }
}
