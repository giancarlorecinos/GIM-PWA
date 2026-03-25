import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { firestore } from '../firebase/config'

export interface Category {
  id: string
  name: string
  isActive: boolean
}

export function useCategories(activeOnly = true) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ref = collection(firestore, 'categories')
    const q = activeOnly
      ? query(ref, where('isActive', '==', true))
      : query(ref)

    const unsubscribe = onSnapshot(q, (snap) => {
      setCategories(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Category)
          .sort((a, b) => a.name.localeCompare(b.name)),
      )
      setLoading(false)
    })

    return unsubscribe
  }, [activeOnly])

  return { categories, loading }
}
