'use client'

import { useEffect } from 'react'
import { useSetupWizard } from '../core/SetupContext'

export default function useKeyboardNavigation() {
    const { actions, currentStep, showHelpPanel } = useSetupWizard()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return
            }

            switch (e.key) {
                case 'ArrowRight':
                case 'Enter':
                    // Only allow Enter for next step if not a button click
                    if (e.key === 'Enter' && e.target instanceof HTMLButtonElement) return
                    // Logic for next step would need validation check
                    break

                case 'ArrowLeft':
                case 'Escape':
                    if (showHelpPanel) {
                        actions.setShowHelpPanel(false)
                    } else if (currentStep > 1) {
                        actions.prevStep()
                    }
                    break

                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault()
                        actions.saveDraft()
                    }
                    break

                case '?':
                    if (e.shiftKey) {
                        actions.setShowHelpPanel(!showHelpPanel)
                    }
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [actions, currentStep, showHelpPanel])

    return {
        shortcuts: [
            { key: 'Enter', description: 'Next Step' },
            { key: 'Esc', description: 'Previous Step' },
            { key: 'Ctrl+S', description: 'Save Draft' },
            { key: '?', description: 'Toggle Help' }
        ]
    }
}
