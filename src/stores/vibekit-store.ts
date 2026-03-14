/**
 * Vibe Kit store — manages the active kit and kit library.
 * Follows the theme-preset-store.ts pattern: Zustand + localStorage.
 */

import { create } from 'zustand'
import type { VibeKit } from '@/types/vibekit'
import { appStorage } from '@/utils/app-storage'

const STORAGE_KEY = 'jeans-vibekit'

interface VibeKitStoreState {
  activeKitId: string | null
  kits: Record<string, VibeKit>

  saveKit: (kit: VibeKit) => void
  removeKit: (kitId: string) => void
  setActiveKit: (kitId: string) => void
  getActiveKit: () => VibeKit | null

  hydrate: () => void
}

function persist(state: { activeKitId: string | null; kits: Record<string, VibeKit> }) {
  try {
    appStorage.setItem(STORAGE_KEY, JSON.stringify({
      activeKitId: state.activeKitId,
      kits: state.kits,
    }))
  } catch { /* ignore quota errors */ }
}

export const useVibeKitStore = create<VibeKitStoreState>((set, get) => ({
  activeKitId: null,
  kits: {},

  saveKit: (kit) => {
    set((s) => {
      const kits = { ...s.kits, [kit.id]: kit }
      persist({ activeKitId: s.activeKitId, kits })
      return { kits }
    })
  },

  removeKit: (kitId) => {
    set((s) => {
      const { [kitId]: _, ...rest } = s.kits
      const activeKitId = s.activeKitId === kitId ? null : s.activeKitId
      persist({ activeKitId, kits: rest })
      return { kits: rest, activeKitId }
    })
  },

  setActiveKit: (kitId) => {
    set({ activeKitId: kitId })
    persist({ activeKitId: kitId, kits: get().kits })
  },

  getActiveKit: () => {
    const { activeKitId, kits } = get()
    return activeKitId ? kits[activeKitId] ?? null : null
  },

  hydrate: () => {
    try {
      const raw = appStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.kits) set({ kits: data.kits })
      if (data.activeKitId) set({ activeKitId: data.activeKitId })
    } catch { /* ignore */ }
  },
}))
