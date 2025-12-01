import { SetupFormData } from '../types/setup'

export const entitySetupService = {
    async submitSetup(data: SetupFormData): Promise<{ success: boolean; entityId?: string; error?: string }> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        try {
            // In a real app, this would POST to /api/entities/setup
            console.log('Submitting entity setup:', data)

            // Simulate success
            return {
                success: true,
                entityId: 'ent_' + Math.random().toString(36).substr(2, 9)
            }
        } catch (error) {
            console.error('Submission error:', error)
            return {
                success: false,
                error: 'Failed to create entity. Please try again.'
            }
        }
    },

    async checkNameAvailability(name: string, country: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 800))
        // Mock check - assume available unless "Taken" is in name
        return !name.toLowerCase().includes('taken')
    }
}
