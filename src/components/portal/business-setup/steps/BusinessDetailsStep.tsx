'use client'

import { useEffect } from 'react'
import { useSetupWizard } from '../core/SetupContext'
import { EconomicZoneSelector, LegalFormSelector, TaxIdField } from '../fields'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function BusinessDetailsStep() {
    const { formData, actions } = useSetupWizard()

    useEffect(() => {
        // Mark complete as fields are optional or have internal validation
        actions.markStepComplete(4)
    }, [actions])

    return (
        <div className="space-y-6 py-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Additional Details</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Tell us more about your business structure.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EconomicZoneSelector
                    value={formData.economicZone}
                    onChange={(val) => actions.updateFormData({ economicZone: val })}
                    country={formData.country}
                />

                <LegalFormSelector
                    value={formData.legalForm}
                    onChange={(val) => actions.updateFormData({ legalForm: val })}
                />

                <TaxIdField
                    value={formData.taxId}
                    onChange={(val) => actions.updateFormData({ taxId: val })}
                />

                <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                        id="website"
                        placeholder="https://example.com"
                        value={formData.website || ''}
                        onChange={(e) => actions.updateFormData({ website: e.target.value })}
                    />
                </div>
            </div>
        </div>
    )
}
