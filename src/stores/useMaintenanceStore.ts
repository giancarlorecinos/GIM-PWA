import { create } from 'zustand'
import type { MaintenanceFilters } from '../types/models'

interface MaintenanceState {
  filters: MaintenanceFilters
  viewMode: 'list' | 'calendar'
  setFilters: (filters: Partial<MaintenanceFilters>) => void
  resetFilters: () => void
  setViewMode: (mode: 'list' | 'calendar') => void
}

const defaultFilters: MaintenanceFilters = {
  status: [],
  periodicity: [],
  responsiblePerson: '',
  category: '',
  searchQuery: '',
}

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  filters: defaultFilters,
  viewMode: 'list',
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setViewMode: (mode) => set({ viewMode: mode }),
}))
