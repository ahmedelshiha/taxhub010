/**
 * useKYC Hook
 * React Query hook for KYC data fetching
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
    transformToSteps,
    calculateOverallProgress,
    countCompletedSteps,
    getOverallStatus,
    type KYCData,
    type KYCStep,
} from '@/lib/kyc'

interface KYCResponse {
    success: boolean
    data: KYCData
}

export function useKYC(entityId?: string) {
    const { data, isLoading, error } = useQuery<KYCResponse>({
        queryKey: ['kyc', entityId],
        queryFn: () => apiClient.get<KYCResponse>(`/api/kyc?entityId=${entityId}`),
        enabled: !!entityId,
        staleTime: 60 * 1000,
    })

    const kycData = data?.data
    const steps: KYCStep[] = kycData ? transformToSteps(kycData) : []
    const progress = calculateOverallProgress(steps)
    const completedCount = countCompletedSteps(steps)
    const overallStatus = getOverallStatus(progress)

    return {
        kycData,
        steps,
        progress,
        completedCount,
        totalSteps: steps.length,
        overallStatus,
        isLoading,
        error,
    }
}
