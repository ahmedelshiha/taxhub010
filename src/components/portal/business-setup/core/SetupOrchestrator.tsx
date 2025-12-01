'use client'

import { Suspense, lazy } from 'react'
import { SetupProvider, useSetupWizard } from './SetupContext'
import SetupProgress from './SetupProgress'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import useKeyboardNavigation from '../hooks/useKeyboardNavigation'
import { STEP_DEFINITIONS } from '../constants/stepDefinitions'

// Lazy load steps
const CountrySelectionStep = lazy(() => import('../steps/CountrySelectionStep'))
const BusinessTypeSelectionStep = lazy(() => import('../steps/BusinessTypeSelectionStep'))
const LicenseVerificationStep = lazy(() => import('../steps/LicenseVerificationStep'))
const BusinessDetailsStep = lazy(() => import('../steps/BusinessDetailsStep'))
const DocumentUploadStep = lazy(() => import('../steps/DocumentUploadStep'))
const ReviewConfirmStep = lazy(() => import('../steps/ReviewConfirmStep'))
const SubmissionStatusStep = lazy(() => import('../steps/SubmissionStatusStep'))

const STEP_COMPONENTS = [
    CountrySelectionStep,
    BusinessTypeSelectionStep,
    LicenseVerificationStep,
    BusinessDetailsStep,
    DocumentUploadStep,
    ReviewConfirmStep,
    SubmissionStatusStep
]

function WizardContent() {
    const {
        currentStep,
        isLoading,
        isSavingDraft,
        lastSavedAt,
        validationErrors,
        actions
    } = useSetupWizard()

    const { shortcuts } = useKeyboardNavigation()

    const CurrentStepComponent = STEP_COMPONENTS[currentStep - 1]
    const isFirstStep = currentStep === 1
    const isLastStep = currentStep === STEP_COMPONENTS.length

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Business Account Setup
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Complete your business profile to get started
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {lastSavedAt && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Save className="w-3 h-3" />
                            Saved {lastSavedAt.toLocaleTimeString()}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => actions.setShowHelpPanel(true)}
                    >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Help
                    </Button>
                </div>
            </div>

            <SetupProgress />

            <Card className="mt-6 border-0 shadow-lg ring-1 ring-gray-200 dark:ring-gray-800">
                <CardContent className="p-6 min-h-[400px]">
                    {validationErrors.length > 0 && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>
                                Please fix the errors below before proceeding.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Suspense fallback={
                        <div className="h-[400px] flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    }>
                        {CurrentStepComponent && <CurrentStepComponent />}
                    </Suspense>
                </CardContent>

                <CardFooter className="bg-gray-50 dark:bg-gray-900/50 p-6 flex justify-between border-t">
                    <Button
                        variant="outline"
                        onClick={actions.prevStep}
                        disabled={isFirstStep || isLoading}
                        className="w-32"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => actions.saveDraft()}
                            disabled={isSavingDraft || isLoading}
                        >
                            {isSavingDraft ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Save Draft'
                            )}
                        </Button>

                        {!isLastStep && (
                            <Button
                                onClick={actions.nextStep}
                                disabled={isLoading}
                                className="w-32 bg-blue-600 hover:bg-blue-700"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>

            <div className="mt-8 text-center text-xs text-gray-400">
                <span className="inline-flex items-center gap-4">
                    <span>⌨️ Shortcuts:</span>
                    {shortcuts.map(s => (
                        <span key={s.key}>
                            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mx-1">
                                {s.key}
                            </kbd>
                            {s.description}
                        </span>
                    ))}
                </span>
            </div>
        </div>
    )
}

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { SetupWizardProps } from '../types/setup'

export default function SetupOrchestrator({ open, onOpenChange, onComplete }: Partial<SetupWizardProps>) {
    const content = (
        <SetupProvider onComplete={onComplete}>
            <WizardContent />
        </SetupProvider>
    )

    // If controlled as a modal
    if (typeof open !== 'undefined') {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white dark:bg-gray-950 border-0">
                    <div className="max-h-[90vh] overflow-y-auto">
                        {content}
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // Standalone page mode
    return content
}
