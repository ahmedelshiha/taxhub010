/**
 * Notification Trigger Functions
 * Automatically generate notifications for key events in the system
 */

import prisma from '@/lib/prisma'

interface NotificationData {
    tenantId: string
    userId: string
    type: string
    title: string
    message: string
    description?: string
    link?: string
    entityType?: string
    entityId?: string
    relatedUserId?: string
    priority?: string
    metadata?: any
}

async function createNotification(data: NotificationData) {
    try {
        return await prisma.notification.create({
            data: {
                tenantId: data.tenantId,
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                description: data.description,
                link: data.link,
                entityType: data.entityType,
                entityId: data.entityId,
                relatedUserId: data.relatedUserId,
                priority: data.priority || 'normal',
                status: 'sent',
                channels: ['in_app'],
                metadata: data.metadata,
            },
        })
    } catch (error) {
        console.error('Failed to create notification:', error)
        throw error
    }
}

/**
 * Notify user when task is assigned to them
 */
export async function notifyTaskAssignment(params: {
    tenantId: string
    taskId: string
    taskTitle: string
    assigneeId: string
    assignedById: string
}) {
    return createNotification({
        tenantId: params.tenantId,
        userId: params.assigneeId,
        type: 'task',
        title: 'New Task Assigned',
        message: `You have been assigned to task: ${params.taskTitle}`,
        link: `/portal/tasks/${params.taskId}`,
        entityType: 'task',
        entityId: params.taskId,
        relatedUserId: params.assignedById,
        priority: 'normal',
    })
}

/**
 * Notify client when booking is confirmed
 */
export async function notifyBookingConfirmation(params: {
    tenantId: string
    bookingId: string
    clientId: string
    serviceName: string
    scheduledAt: Date
}) {
    return createNotification({
        tenantId: params.tenantId,
        userId: params.clientId,
        type: 'booking',
        title: 'Booking Confirmed',
        message: `Your booking for ${params.serviceName} has been confirmed`,
        description: `Scheduled for ${params.scheduledAt.toLocaleDateString()}`,
        link: `/portal/bookings/${params.bookingId}`,
        entityType: 'booking',
        entityId: params.bookingId,
        priority: 'high',
    })
}

/**
 * Notify client about upcoming invoice due date
 */
export async function notifyInvoiceDue(params: {
    tenantId: string
    invoiceId: string
    clientId: string
    invoiceNumber: string
    amount: number
    dueDate: Date
    daysUntilDue: number
}) {
    const urgency = params.daysUntilDue <= 3 ? 'urgent' : 'high'
    const message =
        params.daysUntilDue === 0
            ? `Invoice ${params.invoiceNumber} is due today`
            : `Invoice ${params.invoiceNumber} is due in ${params.daysUntilDue} days`

    return createNotification({
        tenantId: params.tenantId,
        userId: params.clientId,
        type: 'invoice',
        title: 'Invoice Due',
        message,
        description: `Amount: $${params.amount.toFixed(2)}`,
        link: `/portal/invoices/${params.invoiceId}`,
        entityType: 'invoice',
        entityId: params.invoiceId,
        priority: urgency,
        metadata: {
            amount: params.amount,
            dueDate: params.dueDate,
        },
    })
}

/**
 * Notify approver about new approval request
 */
export async function notifyApprovalRequest(params: {
    tenantId: string
    approvalId: string
    approverId: string
    requesterId: string
    approvalType: string
    description?: string
}) {
    return createNotification({
        tenantId: params.tenantId,
        userId: params.approverId,
        type: 'approval',
        title: 'Approval Request',
        message: `New ${params.approvalType} approval request requires your review`,
        description: params.description,
        link: `/portal/approvals/${params.approvalId}`,
        entityType: 'approval',
        entityId: params.approvalId,
        relatedUserId: params.requesterId,
        priority: 'high',
    })
}

/**
 * Notify user about new message received
 */
export async function notifyMessageReceived(params: {
    tenantId: string
    messageId: string
    recipientId: string
    senderId: string
    senderName: string
    subject?: string
    threadId?: string
}) {
    return createNotification({
        tenantId: params.tenantId,
        userId: params.recipientId,
        type: 'message',
        title: 'New Message',
        message: `${params.senderName} sent you a message${params.subject ? `: ${params.subject}` : ''}`,
        link: params.threadId
            ? `/portal/messages/${params.threadId}`
            : `/portal/messages`,
        entityType: 'message',
        entityId: params.messageId,
        relatedUserId: params.senderId,
        priority: 'normal',
    })
}

/**
 * Notify user when document is uploaded
 */
export async function notifyDocumentUploaded(params: {
    tenantId: string
    documentId: string
    userId: string
    uploaderId: string
    uploaderName: string
    documentName: string
    entityType?: string
    entityId?: string
}) {
    return createNotification({
        tenantId: params.tenantId,
        userId: params.userId,
        type: 'document',
        title: 'Document Uploaded',
        message: `${params.uploaderName} uploaded a new document: ${params.documentName}`,
        link: `/portal/documents/${params.documentId}`,
        entityType: params.entityType || 'document',
        entityId: params.entityId || params.documentId,
        relatedUserId: params.uploaderId,
        priority: 'normal',
    })
}

/**
 * Notify admins when entity is submitted for approval
 */
export async function notifyAdminsOfEntitySubmission(params: {
    tenantId: string
    entityId: string
    businessName: string
    userName: string
}) {
    const admins = await prisma.user.findMany({
        where: {
            tenantId: params.tenantId,
            role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        },
    })

    for (const admin of admins) {
        await createNotification({
            tenantId: params.tenantId,
            userId: admin.id,
            type: 'entity',
            title: 'New Business Submission',
            message: `${params.userName} submitted ${params.businessName} for approval`,
            link: `/admin/approvals/businesses`,
            entityType: 'entity',
            entityId: params.entityId,
            priority: 'high',
        })
    }
}

/**
 * Notify client when entity is approved
 */
export async function notifyEntityApproved(params: {
    tenantId: string
    entityId: string
    clientId: string
    businessName: string
}) {
    return createNotification({
        tenantId: params.tenantId,
        userId: params.clientId,
        type: 'entity',
        title: 'Business Approved',
        message: `Your business ${params.businessName} has been approved and is now active`,
        link: `/portal/businesses`,
        entityType: 'entity',
        entityId: params.entityId,
        priority: 'high',
    })
}

/**
 * Notify client when entity is rejected or needs changes
 */
export async function notifyEntityRejected(params: {
    tenantId: string
    entityId: string
    clientId: string
    businessName: string
    reason: string
}) {
    return createNotification({
        tenantId: params.tenantId,
        userId: params.clientId,
        type: 'entity',
        title: 'Business Update Required',
        message: `${params.businessName}: ${params.reason}`,
        link: `/portal/businesses`,
        entityType: 'entity',
        entityId: params.entityId,
        priority: 'urgent',
        metadata: { reason: params.reason },
    })
}

// Export a notification manager object for backward compatibility
export const notificationManager = {
    notifyAdminsOfEntitySubmission,
    notifyEntityApproved,
    notifyEntityRejected,
    notifyClientOfApproval: notifyEntityApproved,
    notifyClientOfRejection: notifyEntityRejected,
}
