import { prisma } from "@/lib/prisma";
import { EntityApprovalStatus } from "@prisma/client";
import { notificationManager } from "@/lib/notifications/triggers";

export class EntityApprovalService {
    /**
     * Submit an entity for approval
     */
    async submitForApproval(entityId: string, userId: string, tenantId: string) {
        // Verify entity exists and belongs to tenant
        const entity = await prisma.entity.findFirst({
            where: {
                id: entityId,
                tenantId,
            },
            include: {
                approval: true,
                creator: true,
            },
        });

        if (!entity) {
            throw new Error("Entity not found");
        }

        // Check if already has an approval record
        if (entity.approval) {
            throw new Error("Entity already has an approval request");
        }

        // Create approval request
        const approval = await prisma.entityApproval.create({
            data: {
                entityId,
                requestedBy: userId,
                status: EntityApprovalStatus.PENDING,
                submittedAt: new Date(),
                metadata: {
                    entityName: entity.name,
                    country: entity.country,
                    legalForm: entity.legalForm,
                },
            },
            include: {
                entity: true,
                requester: true,
            },
        });

        // Update entity status
        await prisma.entity.update({
            where: { id: entityId },
            data: { status: "PENDING_APPROVAL" },
        });

        // Send notification to admins
        await this.notifyAdminsOfNewSubmission(approval);

        // Log audit event
        await prisma.entityAuditLog.create({
            data: {
                entityId,
                userId,
                action: "APPROVAL_SUBMITTED",
                changes: {
                    status: EntityApprovalStatus.PENDING,
                },
            },
        });

        return approval;
    }

    /**
     * Approve an entity
     */
    async approveEntity(
        entityId: string,
        reviewerId: string,
        tenantId: string,
        metadata?: Record<string, any>
    ) {
        // Get approval record
        const approval = await prisma.entityApproval.findUnique({
            where: { entityId },
            include: {
                entity: true,
                requester: true,
            },
        });

        if (!approval) {
            throw new Error("Approval request not found");
        }

        if (approval.entity.tenantId !== tenantId) {
            throw new Error("Unauthorized");
        }

        if (approval.status !== EntityApprovalStatus.PENDING) {
            throw new Error(`Cannot approve entity with status: ${approval.status}`);
        }

        // Update approval
        const updatedApproval = await prisma.entityApproval.update({
            where: { entityId },
            data: {
                status: EntityApprovalStatus.APPROVED,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
                metadata: {
                    ...(approval.metadata as Record<string, any> || {}),
                    ...(metadata || {}),
                    reviewerNote: metadata?.note || null,
                },
            },
            include: {
                entity: true,
                requester: true,
                reviewer: true,
            },
        });

        // Update entity status
        await prisma.entity.update({
            where: { id: entityId },
            data: { status: "ACTIVE" },
        });

        // Send notification to requester
        await this.notifyClientOfApproval(updatedApproval);

        // Log audit event
        await prisma.entityAuditLog.create({
            data: {
                entityId,
                userId: reviewerId,
                action: "APPROVAL_APPROVED",
                changes: {
                    status: EntityApprovalStatus.APPROVED,
                    reviewedBy: reviewerId,
                },
            },
        });

        return updatedApproval;
    }

    /**
     * Reject an entity with reason
     */
    async rejectEntity(
        entityId: string,
        reviewerId: string,
        reason: string,
        tenantId: string,
        metadata?: Record<string, any>
    ) {
        // Get approval record
        const approval = await prisma.entityApproval.findUnique({
            where: { entityId },
            include: {
                entity: true,
                requester: true,
            },
        });

        if (!approval) {
            throw new Error("Approval request not found");
        }

        if (approval.entity.tenantId !== tenantId) {
            throw new Error("Unauthorized");
        }

        if (approval.status !== EntityApprovalStatus.PENDING) {
            throw new Error(`Cannot reject entity with status: ${approval.status}`);
        }

        // Update approval
        const updatedApproval = await prisma.entityApproval.update({
            where: { entityId },
            data: {
                status: EntityApprovalStatus.REJECTED,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
                rejectionReason: reason,
                metadata: {
                    ...(approval.metadata as Record<string, any> || {}),
                    ...(metadata || {}),
                },
            },
            include: {
                entity: true,
                requester: true,
                reviewer: true,
            },
        });

        // Update entity status
        await prisma.entity.update({
            where: { id: entityId },
            data: { status: "REJECTED" },
        });

        // Send notification to requester
        await this.notifyClientOfRejection(updatedApproval);

        // Log audit event
        await prisma.entityAuditLog.create({
            data: {
                entityId,
                userId: reviewerId,
                action: "APPROVAL_REJECTED",
                changes: {
                    status: EntityApprovalStatus.REJECTED,
                    reviewedBy: reviewerId,
                    reason,
                },
            },
        });

        return updatedApproval;
    }

    /**
     * Request changes to an entity
     */
    async requestChanges(
        entityId: string,
        reviewerId: string,
        reason: string,
        tenantId: string,
        metadata?: Record<string, any>
    ) {
        const approval = await prisma.entityApproval.findUnique({
            where: { entityId },
            include: {
                entity: true,
                requester: true,
            },
        });

        if (!approval) {
            throw new Error("Approval request not found");
        }

        if (approval.entity.tenantId !== tenantId) {
            throw new Error("Unauthorized");
        }

        const updatedApproval = await prisma.entityApproval.update({
            where: { entityId },
            data: {
                status: EntityApprovalStatus.REQUIRES_CHANGES,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
                rejectionReason: reason,
                metadata: {
                    ...(approval.metadata as Record<string, any> || {}),
                    ...(metadata || {}),
                },
            },
            include: {
                entity: true,
                requester: true,
                reviewer: true,
            },
        });

        // Update entity status
        await prisma.entity.update({
            where: { id: entityId },
            data: { status: "REQUIRES_CHANGES" },
        });

        // Send notification to requester
        await this.notifyClientOfChangesRequired(updatedApproval);

        // Log audit event
        await prisma.entityAuditLog.create({
            data: {
                entityId,
                userId: reviewerId,
                action: "APPROVAL_CHANGES_REQUESTED",
                changes: {
                    status: EntityApprovalStatus.REQUIRES_CHANGES,
                    reason,
                },
            },
        });

        return updatedApproval;
    }

    /**
     * Get pending approvals for admin dashboard
     */
    async getPendingApprovals(tenantId: string, options?: {
        limit?: number;
        offset?: number;
        country?: string;
    }) {
        const { limit = 50, offset = 0, country } = options || {};

        const where: any = {
            entity: { tenantId },
            status: EntityApprovalStatus.PENDING,
        };

        if (country) {
            where.entity = { ...where.entity, country };
        }

        const [approvals, total] = await Promise.all([
            prisma.entityApproval.findMany({
                where,
                include: {
                    entity: true,
                    requester: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { submittedAt: 'asc' },
                take: limit,
                skip: offset,
            }),
            prisma.entityApproval.count({ where }),
        ]);

        return {
            approvals,
            total,
            limit,
            offset,
        };
    }

    /**
     * Get approval by entity ID
     */
    async getApprovalByEntityId(entityId: string, tenantId: string) {
        const approval = await prisma.entityApproval.findUnique({
            where: { entityId },
            include: {
                entity: true,
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!approval) {
            return null;
        }

        if (approval.entity.tenantId !== tenantId) {
            throw new Error("Unauthorized");
        }

        return approval;
    }

    /**
     * Get approval statistics
     */
    async getApprovalStats(tenantId: string) {
        const [pending, approved, rejected, requiresChanges] = await Promise.all([
            prisma.entityApproval.count({
                where: {
                    entity: { tenantId },
                    status: EntityApprovalStatus.PENDING,
                },
            }),
            prisma.entityApproval.count({
                where: {
                    entity: { tenantId },
                    status: EntityApprovalStatus.APPROVED,
                },
            }),
            prisma.entityApproval.count({
                where: {
                    entity: { tenantId },
                    status: EntityApprovalStatus.REJECTED,
                },
            }),
            prisma.entityApproval.count({
                where: {
                    entity: { tenantId },
                    status: EntityApprovalStatus.REQUIRES_CHANGES,
                },
            }),
        ]);

        return {
            pending,
            approved,
            rejected,
            requiresChanges,
            total: pending + approved + rejected + requiresChanges,
        };
    }

    // Notification helpers
    private async notifyAdminsOfNewSubmission(approval: any) {
        try {
            await notificationManager.notifyAdminsOfEntitySubmission({
                tenantId: approval.entity.tenantId,
                entityId: approval.entityId,
                businessName: approval.entity.name,
                userName: approval.requester.name || approval.requester.email,
            });
        } catch (error) {
            console.error("Failed to send admin notification:", error);
        }
    }

    private async notifyClientOfApproval(approval: any) {
        try {
            await notificationManager.notifyClientOfApproval({
                tenantId: approval.entity.tenantId,
                entityId: approval.entityId,
                clientId: approval.requestedBy,
                businessName: approval.entity.name,
            });
        } catch (error) {
            console.error("Failed to send approval notification:", error);
        }
    }

    private async notifyClientOfRejection(approval: any) {
        try {
            await notificationManager.notifyClientOfRejection({
                tenantId: approval.entity.tenantId,
                entityId: approval.entityId,
                clientId: approval.requestedBy,
                businessName: approval.entity.name,
                reason: approval.rejectionReason || "No reason provided",
            });
        } catch (error) {
            console.error("Failed to send rejection notification:", error);
        }
    }

    private async notifyClientOfChangesRequired(approval: any) {
        try {
            await notificationManager.notifyClientOfRejection({
                tenantId: approval.entity.tenantId,
                entityId: approval.entityId,
                clientId: approval.requestedBy,
                businessName: approval.entity.name,
                reason: approval.rejectionReason || "Changes required",
            });
        } catch (error) {
            console.error("Failed to send changes required notification:", error);
        }
    }
}

export const entityApprovalService = new EntityApprovalService();
