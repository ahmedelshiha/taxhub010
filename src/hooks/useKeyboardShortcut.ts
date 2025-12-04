"use client"

import { useEffect, useCallback, useRef } from "react"
import { useKeyboard } from "@/components/providers/KeyboardProvider"

interface UseShortcutOptions {
    id: string
    combo: string
    description: string
    action: () => void
    disabled?: boolean
}

export function useKeyboardShortcut({
    id,
    combo,
    description,
    action,
    disabled = false,
}: UseShortcutOptions) {
    const { registerShortcut, unregisterShortcut } = useKeyboard()

    // Use ref to store the latest action without causing re-renders
    const actionRef = useRef(action)

    // Keep ref in sync with latest action
    useEffect(() => {
        actionRef.current = action
    }, [action])

    // Stable action wrapper that always calls the latest action
    const stableAction = useCallback(() => {
        actionRef.current()
    }, [])

    useEffect(() => {
        if (disabled) return

        registerShortcut({
            id,
            combo,
            description,
            action: stableAction,
            disabled
        })

        return () => {
            unregisterShortcut(id)
        }
    }, [id, combo, description, disabled, stableAction, registerShortcut, unregisterShortcut])
}
