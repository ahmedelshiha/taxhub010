/**
 * Portal Entities API
 * Thin controller using service layer
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { entitiesService } from '@/services/portal/entities.service'
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

        // Get all entities including pending (for dashboard display)
        const entities = await entitiesService.listAllEntities(tenantId)

        return NextResponse.json({
            success: true,
            data: {
                entities,
                total: entities.length,
            },
        })
    } catch (error: unknown) {
        if (error instanceof ServiceError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: error.statusCode }
            )
        }
        console.error('Portal entities API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch entities',
                data: {
                    entities: [],
                    total: 0,
                },
            },
            { status: 500 }
        )
    }
}

