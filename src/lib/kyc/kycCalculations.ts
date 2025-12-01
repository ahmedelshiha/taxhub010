export interface KYCStep {
    id: string
    title: string
    description: string
    status: 'completed' | 'in_progress' | 'pending'
    percentage: number
}

export interface KYCData {
    identity: {
        status: 'completed' | 'pending'
        documentType?: string
        documentNumber?: string
        verifiedAt?: string
    }
    address: {
        status: 'completed' | 'pending'
        address?: string
        verifiedAt?: string
    }
    businessInfo: {
        status: 'completed' | 'pending'
        registrationNumber?: string
        verifiedAt?: string
    }
    beneficialOwners: {
        status: 'completed' | 'pending'
        ownersCount?: number
        verifiedAt?: string
    }
    taxInfo: {
        status: 'completed' | 'pending'
        tinNumber?: string
        verifiedAt?: string
    }
    riskAssessment: {
        status: 'completed' | 'pending'
        level?: 'low' | 'medium' | 'high'
        verifiedAt?: string
    }
}

/**
 * Transform KYC data to steps array
 */
export function transformToSteps(kycData: KYCData): KYCStep[] {
    return [
        {
            id: 'identity',
            title: 'Identity Verification',
            description: 'Verify your personal or business identity',
            status: kycData.identity.status === 'completed' ? 'completed' : 'pending',
            percentage: kycData.identity.status === 'completed' ? 100 : 0,
        },
        {
            id: 'address',
            title: 'Address Verification',
            description: 'Confirm registered business or residential address',
            status: kycData.address.status === 'completed' ? 'completed' : 'pending',
            percentage: kycData.address.status === 'completed' ? 100 : 0,
        },
        {
            id: 'business',
            title: 'Business Registration',
            description: 'Link business registration and license details',
            status: kycData.businessInfo.status === 'completed' ? 'completed' : 'pending',
            percentage: kycData.businessInfo.status === 'completed' ? 100 : 0,
        },
        {
            id: 'owners',
            title: 'Beneficial Owners',
            description: 'Identify and verify all beneficial owners',
            status: kycData.beneficialOwners.status === 'completed' ? 'completed' : 'pending',
            percentage: kycData.beneficialOwners.status === 'completed' ? 100 : 0,
        },
        {
            id: 'tax',
            title: 'Tax Information',
            description: 'Enter tax ID and filing information',
            status: kycData.taxInfo.status === 'completed' ? 'completed' : 'pending',
            percentage: kycData.taxInfo.status === 'completed' ? 100 : 0,
        },
        {
            id: 'risk',
            title: 'Risk Assessment',
            description: 'Complete compliance and risk questionnaire',
            status: kycData.riskAssessment.status === 'completed' ? 'completed' : 'pending',
            percentage: kycData.riskAssessment.status === 'completed' ? 100 : 0,
        },
    ]
}

/**
 * Count completed steps
 */
export function countCompletedSteps(steps: KYCStep[]): number {
    return steps.filter((s) => s.status === 'completed').length
}

/**
 * Calculate overall progress percentage
 */
export function calculateOverallProgress(steps: KYCStep[]): number {
    if (steps.length === 0) return 0
    return Math.round((countCompletedSteps(steps) / steps.length) * 100)
}

/**
 * Get overall status based on progress
 */
export function getOverallStatus(percentage: number): 'complete' | 'in_progress' | 'not_started' {
    if (percentage === 100) return 'complete'
    if (percentage > 0) return 'in_progress'
    return 'not_started'
}
