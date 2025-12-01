import { SetupFormData } from '../types/setup'

const STORAGE_KEY = 'setup-wizard-draft'

interface DraftData {
    formData: SetupFormData
    currentStep: number
    completedSteps: number[]
    updatedAt: string
}

export const draftService = {
    saveLocal(formData: SetupFormData, currentStep: number, completedSteps: number[]) {
        try {
            const data: DraftData = {
                formData,
                currentStep,
                completedSteps,
                updatedAt: new Date().toISOString()
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        } catch (error) {
            console.error('Failed to save draft locally:', error)
        }
    },

    loadLocal(): DraftData | null {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.error('Failed to load draft locally:', error)
            return null
        }
    },

    clearLocal() {
        localStorage.removeItem(STORAGE_KEY)
    }
}
