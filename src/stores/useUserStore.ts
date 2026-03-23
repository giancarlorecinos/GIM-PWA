import { create } from 'zustand'
import type { UserFilters } from '../types/models'

interface UserState {
  filters: UserFilters
  setFilters: (filters: Partial<UserFilters>) => void
  resetFilters: () => void
}

const defaultFilters: UserFilters = {
  role: [],
  status: [],
  department: '',
  searchQuery: '',
}

export const useUserStore = create<UserState>((set) => ({
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters }),
}))
