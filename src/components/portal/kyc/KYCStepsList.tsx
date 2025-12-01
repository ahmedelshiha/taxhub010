'use client'

import { KYCStepCard } from './KYCStepCard'
import type { KYCStep } from '@/lib/kyc'

export interface KYCStepsListProps {
    steps: KYCStep[]
    entityId?: string
}

export function KYCStepsList({ steps, entityId }: KYCStepsListProps) {
    return (
        <div className="space-y-4">
            {steps.map((step) => (
                <KYCStepCard key={step.id} step={step} entityId={entityId} />
            ))}
        </div>
    )
}
