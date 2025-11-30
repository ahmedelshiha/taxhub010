/**
 * Portal Compliance API
 * Thin controller using service layer
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { complianceService } from '@/services/portal/compliance.service'
import { ServiceError } from '@/services/shared/base.service'

export async function GET(request: NextRequest) {
    try {
        const session = await getSessionOrBypass()
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const tenantId = (session.user as any).tenantId

        // Delegate to service layer
        const data = await complianceService.getDashboardData(tenantId)

        return NextResponse.json({
            success: true,
            data,
        })
    } catch (error: unknown) {
        if (error instanceof ServiceError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: error.statusCode }
            )
        }
        console.error('Portal compliance API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch compliance data' },
            { status: 500 }
        )
    }
}
