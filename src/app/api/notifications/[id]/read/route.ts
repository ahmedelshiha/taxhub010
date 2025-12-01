/**
 * Mark individual notification as read
 * PATCH /api/notifications/[id]/read
 */

import { NextRequest } from 'next/server'
import { respond } from '@/lib/api-response'
import { NotificationHub } from '@/lib/notifications/hub'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'

export const PATCH = withTenantContext(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const ctx = requireTenantContext()
        const { userId } = ctx

        if (!userId) {
            return respond.unauthorized()
        }

        const notificationId = params.id

        // Mark notification as read
        await NotificationHub.markAsRead(notificationId, userId)

        // Get updated unread count
        const unreadCount = await NotificationHub.getUnreadCount(userId)

        return respond.ok({
            data: { success: true, unreadCount },
            meta: { notificationId },
        })
    } catch (error: unknown) {
        console.error('Error marking notification as read:', error)
        return respond.serverError()
    }
})
