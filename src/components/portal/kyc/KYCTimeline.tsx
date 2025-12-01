'use client'

import { ContentSection, EmptyState } from '@/components/ui-oracle'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { KYCStep } from '@/lib/kyc'

export interface KYCTimelineProps {
    steps: KYCStep[]
}

export function KYCTimeline({ steps }: KYCTimelineProps) {
    const completedSteps = steps.filter((s) => s.status === 'completed')

    return (
        <ContentSection>
            <div className="space-y-4">
                {completedSteps.length === 0 ? (
                    <EmptyState
                        icon={AlertCircle}
                        title="No steps completed yet"
                        description="Completed verification steps will appear here"
                        variant="compact"
                    />
                ) : (
                    completedSteps.map((step) => (
                        <div key={step.id} className="flex items-start gap-4">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">{step.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Completed on {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ContentSection>
    )
}
