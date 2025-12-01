/**
 * Portal Overview API
 * Thin controller using service layer
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { portalOverviewService } from '@/services/portal/overview.service'
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

        const userId = (session.user as any).id
        const tenantId = (session.user as any).tenantId

        // Delegate to service layer
        const stats = await portalOverviewService.getOverview(userId, tenantId)

        return NextResponse.json({
            success: true,
            data: stats,
        })
    } catch (error: unknown) {
        // Handle service errors
        if (error instanceof ServiceError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: error.statusCode }
            )
        }

        console.error('Portal overview API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch overview data' },
            { status: 500 }
        )
    }
}
