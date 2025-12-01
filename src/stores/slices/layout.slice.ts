/**
 * Layout Slice
 * Manages sidebar and UI layout state
 */

import { StateCreator } from 'zustand'

export interface SidebarState {
    collapsed: boolean
    width: number
    mobileOpen: boolean
    expandedGroups: string[]
}

export interface LayoutSlice {
    sidebar: SidebarState

    // Actions
    setSidebarCollapsed: (collapsed: boolean) => void
    setSidebarWidth: (width: number) => void
    setMobileOpen: (open: boolean) => void
    toggleGroup: (groupName: string) => void
    setExpandedGroups: (groups: string[]) => void
    toggleSidebar: () => void
}

export const createLayoutSlice: StateCreator<LayoutSlice> = (set) => ({
    // Initial state
    sidebar: {
        collapsed: false,
        width: 256,
        mobileOpen: false,
        expandedGroups: [],
    },

    // Actions
    setSidebarCollapsed: (collapsed) =>
        set((state) => ({
            sidebar: { ...state.sidebar, collapsed },
        })),

    setSidebarWidth: (width) =>
        set((state) => ({
            sidebar: {
                ...state.sidebar,
                width: Math.min(420, Math.max(160, Math.round(width))),
            },
        })),

    setMobileOpen: (open) =>
        set((state) => ({
            sidebar: { ...state.sidebar, mobileOpen: open },
        })),

    toggleGroup: (groupName) =>
        set((state) => ({
            sidebar: {
                ...state.sidebar,
                expandedGroups: state.sidebar.expandedGroups.includes(groupName)
                    ? state.sidebar.expandedGroups.filter((g) => g !== groupName)
                    : [...state.sidebar.expandedGroups, groupName],
            },
        })),

    setExpandedGroups: (groups) =>
        set((state) => ({
            sidebar: { ...state.sidebar, expandedGroups: groups },
        })),

    toggleSidebar: () =>
        set((state) => ({
            sidebar: { ...state.sidebar, collapsed: !state.sidebar.collapsed },
        })),
})
