/**
 * Auth Slice
 * Manages authentication-related state and entity selection
 */

import { StateCreator } from 'zustand'

export interface AuthSlice {
  selectedEntityId: string | null
  
  // Actions
  setSelectedEntity: (entityId: string | null) => void
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  // Initial state
  selectedEntityId: null,

  // Actions
  setSelectedEntity: (entityId) => set({ selectedEntityId: entityId }),
})
