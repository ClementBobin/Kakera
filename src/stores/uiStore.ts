import { create } from 'zustand'
import type { FilterStatus } from '@/types/filters'

interface UiState {
  selectedAnimeId: string | null
  isDetailOpen: boolean
  isSettingsOpen: boolean
  activeTab: FilterStatus
  calendarView: 'calendar' | 'list'
  setSelectedAnimeId: (id: string | null) => void
  setIsDetailOpen: (v: boolean) => void
  setIsSettingsOpen: (v: boolean) => void
  setActiveTab: (tab: FilterStatus) => void
  setCalendarView: (view: 'calendar' | 'list') => void
}

export const useUiStore = create<UiState>((set) => ({
  selectedAnimeId: null,
  isDetailOpen: false,
  isSettingsOpen: false,
  activeTab: 'all',
  calendarView: 'list',
  setSelectedAnimeId: (selectedAnimeId) => set({ selectedAnimeId }),
  setIsDetailOpen: (isDetailOpen) => set({ isDetailOpen }),
  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setCalendarView: (calendarView) => set({ calendarView }),
}))
