'use client'

import { useEffect } from 'react'
import { useSetupWizard } from '../core/SetupContext'
import { TermsCheckbox } from '../fields'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2 } from 'lucide-react'

export default function ReviewConfirmStep() {
    const { formData, actions } = useSetupWizard()

    useEffect(() => {
        if (formData.termsAccepted) {
            actions.clearValidationErrors()
            actions.markStepComplete(6)
        }
    }, [formData.termsAccepted])

    const Section = ({ title, step, children }: { title: string, step: number, children: React.ReactNode }) => (
        <Card className="mb-4">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-900/50 border-b">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => actions.goToStep(step)}
                >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                </Button>
            </CardHeader>
            <CardContent className="p-4 text-sm">
                {children}
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6 py-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Review & Confirm</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Please review your information before submitting.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section title="Location & Type" step={1}>
                    <dl className="grid grid-cols-2 gap-2">
                        <dt className="text-gray-500">Country:</dt>
                        <dd className="font-medium">{formData.country}</dd>
                        <dt className="text-gray-500">Type:</dt>
                        <dd className="font-medium capitalize">{formData.businessType}</dd>
                    </dl>
                </Section>

                <Section title="Business Info" step={3}>
                    <dl className="grid grid-cols-2 gap-2">
                        <dt className="text-gray-500">Name:</dt>
                        <dd className="font-medium">{formData.businessName}</dd>
                        {formData.licenseNumber && (
                            <>
                                <dt className="text-gray-500">License:</dt>
                                <dd className="font-medium">{formData.licenseNumber}</dd>
                            </>
                        )}
                    </dl>
                </Section>

                <Section title="Details" step={4}>
                    <dl className="grid grid-cols-2 gap-2">
                        <dt className="text-gray-500">Zone:</dt>
                        <dd className="font-medium">{formData.economicZone || '-'}</dd>
                        <dt className="text-gray-500">Legal Form:</dt>
                        <dd className="font-medium">{formData.legalForm || '-'}</dd>
                        <dt className="text-gray-500">Tax ID:</dt>
                        <dd className="font-medium">{formData.taxId || '-'}</dd>
                    </dl>
                </Section>

                <Section title="Documents" step={5}>
                    {formData.documents && formData.documents.length > 0 ? (
                        <ul className="list-disc list-inside">
                            {formData.documents.map(d => (
                                <li key={d.id}>{d.name}</li>
                            ))}
                        </ul>
                    ) : (
                        <span className="text-gray-500 italic">No documents uploaded</span>
                    )}
                </Section>
            </div>

            <div className="mt-8">
                <TermsCheckbox
                    checked={formData.termsAccepted}
                    onChange={(checked) => actions.updateFormData({ termsAccepted: checked })}
                />
            </div>

            <div className="flex justify-center mt-6">
                <Button
                    size="lg"
                    className="w-full md:w-1/2 bg-green-600 hover:bg-green-700"
                    onClick={() => actions.submitSetup()}
                    disabled={!formData.termsAccepted}
                >
                    &quot;Submit Application&quot;
                </Button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
                By clicking &quot;Submit&quot;, you agree to our processing of your data.
            </p>
        </div>
    )
}
