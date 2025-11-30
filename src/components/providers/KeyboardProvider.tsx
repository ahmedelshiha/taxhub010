"use client"

import { createContext, useContext, useEffect, useCallback, useState } from "react"

type KeyCombo = string // e.g., "Meta+k", "Shift+?", "Escape"

interface Shortcut {
    id: string
    combo: KeyCombo
    description: string
    action: () => void
    disabled?: boolean
}

interface KeyboardContextType {
    registerShortcut: (shortcut: Shortcut) => void
    unregisterShortcut: (id: string) => void
    shortcuts: Shortcut[]
}

const KeyboardContext = createContext<KeyboardContextType | null>(null)

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([])

    const registerShortcut = useCallback((shortcut: Shortcut) => {
        setShortcuts((prev) => {
            // Prevent duplicates by ID
            if (prev.some((s) => s.id === shortcut.id)) return prev
            return [...prev, shortcut]
        })
    }, [])

    const unregisterShortcut = useCallback((id: string) => {
        setShortcuts((prev) => prev.filter((s) => s.id !== id))
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input/textarea is focused (unless it's a global shortcut like Cmd+K)
            const target = e.target as HTMLElement
            const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable

            // Build combo string
            const parts = []
            if (e.metaKey || e.ctrlKey) parts.push("Meta") // Normalize Ctrl/Cmd
            if (e.shiftKey) parts.push("Shift")
            if (e.altKey) parts.push("Alt")

            // Handle special keys
            let key = e.key
            if (key === " ") key = "Space"
            if (key === "Escape") key = "Esc"

            // Don't add modifier keys themselves to the end
            if (!["Meta", "Control", "Shift", "Alt"].includes(key)) {
                parts.push(key)
            }

            const combo = parts.join("+")

            // Find matching shortcut
            const match = shortcuts.find((s) => {
                if (s.disabled) return false

                // Simple exact match for now
                // Could be enhanced to support "Ctrl+k" matching "Meta+k" explicitly if needed
                return s.combo.toLowerCase() === combo.toLowerCase()
            })

            if (match) {
                // Allow default for some keys if needed, but usually prevent
                if (!isInput || match.combo.includes("Meta") || match.combo === "Esc") {
                    e.preventDefault()
                    match.action()
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [shortcuts])

    return (
        <KeyboardContext.Provider value={{ registerShortcut, unregisterShortcut, shortcuts }}>
            {children}
        </KeyboardContext.Provider>
    )
}

export function useKeyboard() {
    const context = useContext(KeyboardContext)
    if (!context) {
        throw new Error("useKeyboard must be used within a KeyboardProvider")
    }
    return context
}
