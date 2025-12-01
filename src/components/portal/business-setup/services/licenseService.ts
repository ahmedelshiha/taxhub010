import { SetupFormData } from '../types/setup'

interface LicenseLookupResult {
    found: boolean
    data?: {
        name: string
        expiry: string
        activities: string[]
        type: string
    }
    error?: string
}

const MOCK_LICENSES: Record<string, any> = {
    'CN-1234567': {
        name: 'Tech Solutions LLC',
        expiry: '2025-12-31',
        activities: ['Software Development', 'IT Consultancy'],
        type: 'LLC'
    },
    'CN-9876543': {
        name: 'Global Trading Co',
        expiry: '2024-06-30',
        activities: ['General Trading', 'Import/Export'],
        type: 'Sole Proprietorship'
    }
}

export const licenseService = {
    async lookupLicense(licenseNumber: string, country: 'AE' | 'SA' | 'EG'): Promise<LicenseLookupResult> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Simulate random network error (5% chance)
        if (Math.random() < 0.05) {
            throw new Error('Network error. Please try again.')
        }

        const license = MOCK_LICENSES[licenseNumber]

        if (license) {
            return {
                found: true,
                data: license
            }
        }

        return {
            found: false,
            error: 'License not found in registry'
        }
    },

    validateFormat(licenseNumber: string, country: string): boolean {
        // Simple format validation
        if (country === 'AE') return /^CN-\d{7}$/.test(licenseNumber)
        if (country === 'SA') return /^\d{10}$/.test(licenseNumber)
        return licenseNumber.length >= 5
    }
}
