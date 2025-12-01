'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Rocket, User } from 'lucide-react'
import { useSetupWizard } from '../core/SetupContext'
import { cn } from '@/lib/utils'

type BusinessType = 'existing' | 'new' | 'individual'

interface BusinessTypeOption {
    type: BusinessType
    icon: React.ReactNode
    title: string
    description: string
    features: string[]
    estimatedTime: string
}

const BUSINESS_TYPES: BusinessTypeOption[] = [
    {
        type: 'existing',
        icon: <Building2 className="h-12 w-12" />,
        title: 'Existing Business',
        description: 'I have a license and want to link it to TaxHub',
        features: [
            'Verify existing license',
            'Auto-fill business details',
            'Quick setup process',
        ],
        estimatedTime: '3-5 minutes',
    },
    {
        type: 'new',
        icon: <Rocket className="h-12 w-12" />,
        title: 'New Startup',
        description: "I'm registering a new business from scratch",
        features: [
            'Step-by-step guidance',
            'Document checklist',
            'Registration assistance',
        ],
        estimatedTime: '10-15 minutes',
    },
    {
        type: 'individual',
        icon: <User className="h-12 w-12" />,
        title: 'Individual / Freelancer',
        description: 'Personal freelancer or consultant account',
        features: [
            'Simplified setup',
            'Personal tax tracking',
            'Invoice management',
        ],
        estimatedTime: '2-3 minutes',
    },
]

export default function BusinessTypeSelectionStep() {
    const { formData, actions } = useSetupWizard()

    useEffect(() => {
        // Step-level validation
        if (formData.businessType) {
            actions.clearValidationErrors()
            actions.markStepComplete(2)
        } else {
            actions.setValidationErrors([
                { field: 'businessType', message: 'Please select a business type' }
            ])
        }
    }, [formData.businessType])

    const handleTypeSelect = (type: BusinessType) => {
        actions.updateFormData({ businessType: type })
    }

    return (
        <div className="space-y-6 py-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Choose Your Business Type</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Select the option that best describes your situation
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {BUSINESS_TYPES.map((option) => (
                    <Card
                        key={option.type}
                        className={cn(
                            'cursor-pointer transition-all hover:shadow-lg',
                            formData.businessType === option.type
                                ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-2 border-transparent hover:border-blue-300'
                        )}
                        onClick={() => handleTypeSelect(option.type)}
                    >
                        <CardHeader>
                            <div className={cn(
                                'mb-4 transition-colors',
                                formData.businessType === option.type
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                            )}>
                                {option.icon}
                            </div>
                            <CardTitle className="text-lg">{option.title}</CardTitle>
                            <CardDescription>{option.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 mb-4">
                                {option.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                <span>⏱️</span>
                                <span>Estimated time: {option.estimatedTime}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Help section */}
            <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent className="pt-6">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                        <span>💡</span>
                        Not sure which to choose?
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>
                            <strong>Choose Existing Business</strong> if you already have a commercial license
                            or registration and want to connect it to TaxHub.
                        </p>
                        <p>
                            <strong>Choose New Startup</strong> if you&apos;re in the process of registering a new
                            company and need guidance through the setup.
                        </p>
                        <p>
                            <strong>Choose Individual</strong> if you&apos;re a freelancer, consultant, or operating
                            as a sole proprietor.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
