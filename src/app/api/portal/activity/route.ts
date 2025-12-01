/**
 * Portal Activity API
 * Returns recent activity feed for ActivityTab
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

        const limit = 50 // Show last 50 activities

        // Fetch recent audit logs as activity feed
        const auditLogs = await prisma.auditLog.findMany({
            where: { tenantId },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        // Transform audit logs to activity items
        const activities = auditLogs.map(log => {
            // Determine activity type based on resource
            let type: 'task' | 'booking' | 'invoice' | 'document' | 'compliance' | 'system' = 'system'

            const resource = log.resource || 'Unknown'
            const resourceLower = resource.toLowerCase()

            if (resourceLower.includes('task')) type = 'task'
            else if (resourceLower.includes('booking')) type = 'booking'
            else if (resourceLower.includes('invoice')) type = 'invoice'
            else if (resourceLower.includes('document') || resourceLower.includes('attachment')) type = 'document'
            else if (resourceLower.includes('compliance') || resourceLower.includes('obligation') || resourceLower.includes('filing')) type = 'compliance'

            // Create descriptive title and description
            const action = log.action.toLowerCase()

            let title = `${resource} ${action}`
            let description = `${action} operation on ${resource}`

            // Better formatting
            if (action === 'create') {
                title = `New ${resource} created`
                description = `A new ${resourceLower} was created`
            } else if (action === 'update') {
                title = `${resource} updated`
                description = `${resource} was modified`
            } else if (action === 'delete') {
                title = `${resource} deleted`
                description = `${resource} was removed`
            }

            return {
                id: log.id,
                type,
                title,
                description,
                timestamp: log.createdAt.toISOString(),
                user: log.user ? {
                    name: log.user.name || 'Unknown user',
                } : undefined,
                metadata: {
                    resource: log.resource,
                    action: log.action,
                },
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                activities,
                total: activities.length,
            },
        })
    } catch (error: unknown) {
        console.error('Portal activity API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch activity feed',
                data: {
                    activities: [],
                    total: 0,
                },
            },
            { status: 500 }
        )
    }
}
