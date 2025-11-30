/**
 * Preferences Slice
 * Manages user preferences for widgets, tabs, and UI customization
 */

import { StateCreator } from 'zustand'

export interface WidgetPreference {
    visible: boolean
    order: number
}

export interface PreferencesSlice {
    activeTab: string
    widgetPreferences: Record<string, WidgetPreference>

    // Actions
    setActiveTab: (tab: string) => void
    updateWidgetPreference: (
        widgetId: string,
        preference: Partial<WidgetPreference>
    ) => void
    resetWidgetPreferences: () => void
}

export const createPreferencesSlice: StateCreator<PreferencesSlice> = (set) => ({
    // Initial state
    activeTab: 'overview',
    widgetPreferences: {},

    // Actions
    setActiveTab: (tab) => set({ activeTab: tab }),

    updateWidgetPreference: (widgetId, preference) =>
        set((state) => ({
            widgetPreferences: {
                ...state.widgetPreferences,
                [widgetId]: {
                    ...(state.widgetPreferences[widgetId] || { visible: true, order: 0 }),
                    ...preference,
                },
            },
        })),

    resetWidgetPreferences: () => set({ widgetPreferences: {} }),
})
