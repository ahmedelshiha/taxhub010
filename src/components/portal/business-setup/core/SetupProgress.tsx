'use client'

import { Check } from 'lucide-react'
import { useSetupWizard } from './SetupContext'
import { STEP_DEFINITIONS } from '../constants/stepDefinitions'
import { cn } from '@/lib/utils'

export default function SetupProgress() {
    const { currentStep, completedSteps, actions } = useSetupWizard()

    // Calculate progress percentage
    const progress = Math.round(((currentStep - 1) / STEP_DEFINITIONS.length) * 100)

    return (
        <div className="w-full py-4">
            {/* Progress Bar */}
            <div className="relative mb-8">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100 dark:bg-gray-800">
                    <div
                        style={{ width: `${progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500 ease-out"
                    />
                </div>

                {/* Steps */}
                <div className="flex justify-between items-start relative">
                    {/* Connecting Line */}
                    <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />

                    {STEP_DEFINITIONS.map((step) => {
                        const isCompleted = completedSteps.includes(step.number)
                        const isCurrent = currentStep === step.number
                        const isClickable = isCompleted || step.number < currentStep

                        return (
                            <div
                                key={step.number}
                                className="flex flex-col items-center group"
                                style={{ width: `${100 / STEP_DEFINITIONS.length}%` }}
                            >
                                <button
                                    onClick={() => isClickable && actions.goToStep(step.number)}
                                    disabled={!isClickable}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 border-2 bg-white dark:bg-gray-900",
                                        isCompleted ? "border-green-500 text-green-500" :
                                            isCurrent ? "border-blue-600 text-blue-600 ring-4 ring-blue-50 dark:ring-blue-900/20" :
                                                "border-gray-300 text-gray-400"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step.number
                                    )}
                                </button>
                                <span className={cn(
                                    "mt-2 text-xs font-medium text-center max-w-[80px] hidden sm:block transition-colors",
                                    isCurrent ? "text-blue-600" :
                                        isCompleted ? "text-green-600" :
                                            "text-gray-500"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
