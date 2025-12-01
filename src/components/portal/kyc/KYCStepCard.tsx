'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import { getCardBackgroundColor, type KYCStep } from '@/lib/kyc'

export interface KYCStepCardProps {
    step: KYCStep
    entityId?: string
}

export function KYCStepCard({ step, entityId }: KYCStepCardProps) {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/portal/kyc/${step.id}?entityId=${entityId}`)
    }

    return (
        <Card
            className={`cursor-pointer hover:shadow-md transition-shadow ${getCardBackgroundColor(step.status)}`}
            onClick={handleClick}
        >
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        {step.status === 'completed' ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : step.status === 'in_progress' ? (
                            <div className="h-6 w-6 rounded-full border-2 border-blue-600 border-r-transparent animate-spin flex-shrink-0 mt-0.5" />
                        ) : (
                            <Circle className="h-6 w-6 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>

                            {step.status === 'completed' && (
                                <p className="text-xs text-green-700 dark:text-green-300 mt-2">✓ Verified</p>
                            )}
                        </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
            </CardContent>
        </Card>
    )
}
