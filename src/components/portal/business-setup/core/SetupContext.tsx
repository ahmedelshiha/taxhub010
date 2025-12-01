'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { SetupFormData, SetupContextType, ValidationResult } from '../types/setup'
import { draftService, entitySetupService } from '../services'

const SetupContext = createContext<SetupContextType | undefined>(undefined)

export function SetupProvider({ children, onComplete }: { children: ReactNode; onComplete?: (entityId: string) => void }) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState<number[]>([])
    const [formData, setFormData] = useState<SetupFormData>({})
    const [isLoading, setIsLoading] = useState(false)
    const [isSavingDraft, setIsSavingDraft] = useState(false)
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
    const [validationErrors, setValidationErrors] = useState<ValidationResult[]>([])
    const [showHelpPanel, setShowHelpPanel] = useState(false)

    // Load draft on mount
    useEffect(() => {
        const draft = draftService.loadLocal()
        if (draft) {
            setFormData(draft.formData || {})
            setCurrentStep(draft.currentStep || 1)
            setCompletedSteps(draft.completedSteps || [])
            setLastSavedAt(new Date(draft.updatedAt))
        }
    }, [])

    // Auto-save draft
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Object.keys(formData).length > 0) {
                saveDraft()
            }
        }, 30000) // 30 seconds

        return () => clearTimeout(timer)
    }, [formData, currentStep, completedSteps])

    const updateFormData = useCallback((data: Partial<SetupFormData>) => {
        setFormData(prev => ({ ...prev, ...data }))
        // Clear errors for fields being updated
        if (validationErrors.length > 0) {
            const fields = Object.keys(data)
            setValidationErrors(prev => prev.filter(err => !fields.includes(err.field)))
        }
    }, [validationErrors])

    const saveDraft = useCallback(async () => {
        try {
            setIsSavingDraft(true)
            draftService.saveLocal(formData, currentStep, completedSteps)
            setLastSavedAt(new Date())
        } catch (error) {
            console.error('Failed to save draft:', error)
        } finally {
            setIsSavingDraft(false)
        }
    }, [formData, currentStep, completedSteps])

    const markStepComplete = useCallback((step: number) => {
        if (!completedSteps.includes(step)) {
            setCompletedSteps(prev => [...prev, step])
        }
    }, [completedSteps])

    const goToStep = useCallback((step: number) => {
        setCurrentStep(step)
    }, [])

    const nextStep = useCallback(() => {
        setCurrentStep(prev => prev + 1)
        window.scrollTo(0, 0)
    }, [])

    const prevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(1, prev - 1))
        window.scrollTo(0, 0)
    }, [])

    const submitSetup = useCallback(async () => {
        try {
            setIsLoading(true)
            const result = await entitySetupService.submitSetup(formData)

            if (!result.success) {
                throw new Error(result.error || 'Setup failed')
            }

            draftService.clearLocal()
            return result
        } catch (error) {
            console.error('Setup submission error:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [formData])

    const value = {
        currentStep,
        completedSteps,
        formData,
        isLoading,
        isSavingDraft,
        lastSavedAt,
        validationErrors,
        showHelpPanel,
        actions: {
            updateFormData,
            goToStep,
            nextStep,
            prevStep,
            saveDraft,
            submitSetup,
            setValidationErrors,
            clearValidationErrors: () => setValidationErrors([]),
            markStepComplete,
            setShowHelpPanel,
            onComplete
        }
    }

    return (
        <SetupContext.Provider value={value}>
            {children}
        </SetupContext.Provider>
    )
}

export function useSetupWizard() {
    const context = useContext(SetupContext)
    if (context === undefined) {
        throw new Error('useSetupWizard must be used within a SetupProvider')
    }
    return context
}
