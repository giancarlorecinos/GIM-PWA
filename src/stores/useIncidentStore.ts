import { create } from 'zustand'
import type { IncidentFilters } from '../types/models'

interface IncidentState {
  filters: IncidentFilters
  setFilters: (filters: Partial<IncidentFilters>) => void
  resetFilters: () => void
}

const defaultFilters: IncidentFilters = {
  status: [],
  priority: [],
  assignee: '',
  category: '',
  searchQuery: '',
}

export const useIncidentStore = create<IncidentState>((set) => ({
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters }),
}))
