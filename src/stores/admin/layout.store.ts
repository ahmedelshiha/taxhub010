/**
 * Admin Layout Store
 * Centralized state management for admin dashboard layout
 * Refactored to use slice pattern for better modularity
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createLayoutSlice, LayoutSlice } from '@/stores/slices/layout.slice'

// Legacy storage migration helper
const SIDEBAR_KEYS = {
  WIDTH: 'admin:sidebar:width',
  COLLAPSED: 'admin:sidebar:collapsed',
  EXPANDED: 'admin:sidebar:expanded',
}

function readLegacyStorage() {
  try {
    if (typeof window === 'undefined') return null
    const widthRaw = window.localStorage.getItem(SIDEBAR_KEYS.WIDTH)
    const collapsedRaw = window.localStorage.getItem(SIDEBAR_KEYS.COLLAPSED)
    const expandedRaw = window.localStorage.getItem(SIDEBAR_KEYS.EXPANDED)

    const width = widthRaw ? parseInt(widthRaw, 10) : undefined
    const collapsed = collapsedRaw === '1' || collapsedRaw === 'true'
    const expanded = expandedRaw ? JSON.parse(expandedRaw) : undefined

    return {
      width: Number.isFinite(width) ? width : undefined,
      collapsed: typeof collapsedRaw === 'string' ? collapsed : undefined,
      expanded: Array.isArray(expanded) ? expanded : undefined,
    }
  } catch (e) {
    return null
  }
}

// Combined store type
export type AdminLayoutStore = LayoutSlice

// Read legacy data once
const legacy = typeof window !== 'undefined' ? readLegacyStorage() : null

// Create the store with slice pattern
export const useAdminLayoutStore = create<AdminLayoutStore>()(
  persist(
    (...a) => {
      const slice = createLayoutSlice(...a)

      // Apply legacy defaults if available
      if (legacy) {
        slice.sidebar = {
          ...slice.sidebar,
          collapsed: legacy.collapsed ?? slice.sidebar.collapsed,
          width: legacy.width ?? slice.sidebar.width,
          expandedGroups: legacy.expanded ?? ['dashboard', 'business'],
        }
      } else {
        slice.sidebar.expandedGroups = ['dashboard', 'business']
      }

      return slice
    },
    {
      name: 'admin-layout-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && window.localStorage)
          return window.localStorage

        // Provide an in-memory fallback storage for server/test environments
        const memoryStore = new Map<string, string>()
        return {
          getItem: (key: string) => {
            return memoryStore.has(key) ? (memoryStore.get(key) as string) : null
          },
          setItem: (key: string, value: string) => {
            memoryStore.set(key, value)
          },
          removeItem: (key: string) => {
            memoryStore.delete(key)
          },
        } as Storage
      }),
      partialize: (state) => ({
        sidebar: {
          collapsed: state.sidebar.collapsed,
          width: state.sidebar.width,
          expandedGroups: state.sidebar.expandedGroups,
          // Do not persist mobileOpen
        },
      }),
    }
  )
)

// Backward compatibility exports
export interface SidebarState {
  collapsed: boolean
  width: number
  mobileOpen: boolean
  expandedGroups: string[]
}

// Re-export with backward compatible names
export const useAdminSidebarCollapsed = () =>
  useAdminLayoutStore((state) => state.sidebar.collapsed)

export const useAdminSidebarWidth = () =>
  useAdminLayoutStore((state) => state.sidebar.width)

export const useAdminExpandedGroups = () =>
  useAdminLayoutStore((state) => state.sidebar.expandedGroups)
