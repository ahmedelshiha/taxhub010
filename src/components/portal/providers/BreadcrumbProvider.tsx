"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface BreadcrumbItem {
    label: string
    href: string
}

interface BreadcrumbContextType {
    items: BreadcrumbItem[] | null
    setBreadcrumbs: (items: BreadcrumbItem[]) => void
    resetBreadcrumbs: () => void
    setDynamicLabel: (segment: string, label: string) => void
    dynamicLabels: Record<string, string>
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<BreadcrumbItem[] | null>(null)
    const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({})

    const setBreadcrumbs = (newItems: BreadcrumbItem[]) => {
        setItems(newItems)
    }

    const resetBreadcrumbs = () => {
        setItems(null)
        setDynamicLabels({})
    }

    const setDynamicLabel = (segment: string, label: string) => {
        setDynamicLabels(prev => ({
            ...prev,
            [segment]: label
        }))
    }

    return (
        <BreadcrumbContext.Provider value={{
            items,
            setBreadcrumbs,
            resetBreadcrumbs,
            setDynamicLabel,
            dynamicLabels
        }}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

export function useBreadcrumbs() {
    const context = useContext(BreadcrumbContext)
    if (context === undefined) {
        throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider')
    }
    return context
}
