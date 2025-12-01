'use client'

import { ContentSection } from '@/components/ui-oracle'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getStatusBadgeVariant, getStatusText } from '@/lib/kyc'

export interface KYCProgressCardProps {
  progress: number
  completedCount: number
  totalSteps: number
  overallStatus: string
}

export function KYCProgressCard({
  progress,
  completedCount,
  totalSteps,
  overallStatus,
}: KYCProgressCardProps) {
  return (
    <ContentSection>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Verification Progress
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {completedCount} of {totalSteps} steps completed
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{progress}%</div>
          <Badge variant={getStatusBadgeVariant(overallStatus)}>
            {getStatusText(overallStatus)}
          </Badge>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </ContentSection>
  )
}
