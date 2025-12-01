import { SetupFormData, ValidationResult } from '../types/setup'

export const validationService = {
    validateStep(step: number, data: SetupFormData): ValidationResult[] {
        const errors: ValidationResult[] = []

        switch (step) {
            case 1: // Country
                if (!data.country) {
                    errors.push({ field: 'country', message: 'Please select a country' })
                }
                break

            case 2: // Business Type
                if (!data.businessType) {
                    errors.push({ field: 'businessType', message: 'Please select a business type' })
                }
                break

            case 3: // License
                if (data.businessType === 'existing') {
                    if (!data.licenseNumber) {
                        errors.push({ field: 'licenseNumber', message: 'License number is required' })
                    }
                    if (!data.businessName) {
                        errors.push({ field: 'businessName', message: 'Business name is required' })
                    }
                } else if (data.businessType === 'new' || data.businessType === 'individual') {
                    if (!data.businessName) {
                        errors.push({ field: 'businessName', message: 'Business name is required' })
                    }
                }
                break

            case 4: // Details
                // Optional fields mostly, but could validate format if filled
                if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                    errors.push({ field: 'email', message: 'Invalid email format' })
                }
                break

            case 6: // Review
                if (!data.termsAccepted) {
                    errors.push({ field: 'termsAccepted', message: 'You must accept the terms and conditions' })
                }
                break
        }

        return errors
    },

    validateAll(data: SetupFormData): ValidationResult[] {
        let errors: ValidationResult[] = []
        for (let i = 1; i <= 6; i++) {
            errors = [...errors, ...this.validateStep(i, data)]
        }
        return errors
    }
}
