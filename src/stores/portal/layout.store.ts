/**
 * Portal Layout Store
 * Centralized state management for portal dashboard layout
 * Refactored to use slice pattern for better modularity
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createLayoutSlice, LayoutSlice } from '@/stores/slices/layout.slice'
import { createPreferencesSlice, PreferencesSlice } from '@/stores/slices/preferences.slice'
import { createAuthSlice, AuthSlice } from '@/stores/slices/auth.slice'

// Combined store type
export type PortalLayoutStore = LayoutSlice & PreferencesSlice & AuthSlice

// Create the combined store
export const usePortalLayoutStore = create<PortalLayoutStore>()(
    persist(
        (...a) => ({
            ...createLayoutSlice(...a),
            ...createPreferencesSlice(...a),
            ...createAuthSlice(...a),
        }),
        {
            name: 'portal-layout-storage',
            partialize: (state) => ({
                sidebar: state.sidebar,
                activeTab: state.activeTab,
                widgetPreferences: state.widgetPreferences,
                // Don't persist selectedEntityId - should be session-specific
            }),
        }
    )
)

// ===== Sidebar Selectors =====
export const usePortalSidebarCollapsed = () =>
    usePortalLayoutStore((state) => state.sidebar.collapsed)

export const usePortalSidebarWidth = () =>
    usePortalLayoutStore((state) => state.sidebar.width)

export const usePortalExpandedGroups = () =>
    usePortalLayoutStore((state) => state.sidebar.expandedGroups)

// ===== Dashboard Selectors =====
export const usePortalActiveTab = () =>
    usePortalLayoutStore((state) => state.activeTab)

export const usePortalSelectedEntity = () =>
    usePortalLayoutStore((state) => state.selectedEntityId)

export const usePortalWidgetPreferences = () =>
    usePortalLayoutStore((state) => state.widgetPreferences)

// ===== Actions Selectors =====
// Backward compatible combined actions (includes all actions)
export const usePortalLayoutActions = () =>
    usePortalLayoutStore((state) => ({
        // Layout actions
        setSidebarCollapsed: state.setSidebarCollapsed,
        setSidebarWidth: state.setSidebarWidth,
        setMobileOpen: state.setMobileOpen,
        toggleGroup: state.toggleGroup,
        toggleSidebar: state.toggleSidebar,
        // Preferences actions
        setActiveTab: state.setActiveTab,
        updateWidgetPreference: state.updateWidgetPreference,
        resetWidgetPreferences: state.resetWidgetPreferences,
        // Auth actions
        setSelectedEntity: state.setSelectedEntity,
    }))

// Granular action selectors for better performance
export const usePortalSidebarActions = () =>
    usePortalLayoutStore((state) => ({
        setSidebarCollapsed: state.setSidebarCollapsed,
        setSidebarWidth: state.setSidebarWidth,
        setMobileOpen: state.setMobileOpen,
        toggleGroup: state.toggleGroup,
        toggleSidebar: state.toggleSidebar,
    }))

export const usePortalPreferencesActions = () =>
    usePortalLayoutStore((state) => ({
        setActiveTab: state.setActiveTab,
        updateWidgetPreference: state.updateWidgetPreference,
        resetWidgetPreferences: state.resetWidgetPreferences,
    }))

export const usePortalAuthActions = () =>
    usePortalLayoutStore((state) => ({
        setSelectedEntity: state.setSelectedEntity,
    }))
