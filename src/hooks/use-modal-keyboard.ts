/**
 * Custom hook for keyboard navigation in modals
 * Provides Esc to close and Enter to submit functionality
 */

import { useEffect } from 'react'

interface UseModalKeyboardOptions {
    isOpen: boolean
    onClose: () => void
    onSubmit?: () => void
    closeOnEscape?: boolean
    submitOnEnter?: boolean
    disabled?: boolean
}

export function useModalKeyboard({
    isOpen,
    onClose,
    onSubmit,
    closeOnEscape = true,
    submitOnEnter = true,
    disabled = false,
}: UseModalKeyboardOptions) {
    useEffect(() => {
        if (!isOpen || disabled) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Esc to close
            if (closeOnEscape && e.key === 'Escape') {
                e.preventDefault()
                onClose()
                return
            }

            // Enter to submit (only if not in textarea)
            if (submitOnEnter && e.key === 'Enter' && !e.shiftKey && onSubmit) {
                const target = e.target as HTMLElement

                // Don't submit if user is in a textarea or multi-line input
                if (target.tagName === 'TEXTAREA') return

                // Don't submit if in a contenteditable element
                if (target.isContentEditable) return

                // Don't submit if target has data-no-enter attribute
                if (target.hasAttribute('data-no-enter')) return

                e.preventDefault()
                onSubmit()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose, onSubmit, closeOnEscape, submitOnEnter, disabled])
}
