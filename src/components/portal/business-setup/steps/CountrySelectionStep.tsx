'use client'

import { useEffect } from 'react'
import { useSetupWizard } from '../core/SetupContext'
import { CountrySelector } from '../fields'

export default function CountrySelectionStep() {
    const { formData, actions } = useSetupWizard()

    useEffect(() => {
        // Step-level validation
        if (formData.country) {
            actions.clearValidationErrors()
            actions.markStepComplete(1)
        } else {
            actions.setValidationErrors([
                { field: 'country', message: 'Please select a country' }
            ])
        }
    }, [formData.country])

    const handleCountrySelect = (country: string) => {
        actions.updateFormData({ country })
    }

    return (
        <div className="space-y-6 py-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Where is your business located?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Select the jurisdiction where your company is registered or will be registered.
                </p>
            </div>

            <CountrySelector
                value={formData.country}
                onChange={handleCountrySelect}
            />
        </div>
    )
}
