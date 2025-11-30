"use client"

import { useEffect } from "react"
import { useKeyboard } from "@/components/providers/KeyboardProvider"

interface UseShortcutOptions {
    id: string
    combo: string
    description: string
    action: () => void
    disabled?: boolean
    deps?: any[]
}

export function useKeyboardShortcut({
    id,
    combo,
    description,
    action,
    disabled = false,
    deps = []
}: UseShortcutOptions) {
    const { registerShortcut, unregisterShortcut } = useKeyboard()

    useEffect(() => {
        if (disabled) return

        registerShortcut({
            id,
            combo,
            description,
            action,
            disabled
        })

        return () => {
            unregisterShortcut(id)
        }
    }, [id, combo, description, disabled, registerShortcut, unregisterShortcut, ...deps])
}
