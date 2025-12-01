/**
 * Portal Overview Service
 * Business logic for dashboard overview statistics
 * Extracted from API routes for reusability and testing
 */

import { prisma } from '@/lib/prisma'

export interface OverviewStats {
    tasks: {
        total: number
        pending: number
        trend: number
    }
    bookings: {
        upcoming: number
        thisWeek: number
        trend: number
    }
    invoices: {
        outstanding: number
        overdue: number
        total: number
    }
    compliance: {
        pending: number
        due: number
        trend: number
    }
}

export class PortalOverviewService {
    /**
     * Get comprehensive dashboard overview statistics
     */
    async getOverview(userId: string, tenantId: string): Promise<OverviewStats> {
        const dateRanges = this.calculateDateRanges()

        const [
            taskStats,
            bookingStats,
            invoiceStats,
            complianceStats,
        ] = await Promise.all([
            this.getTaskStats(tenantId, dateRanges),
            this.getBookingStats(tenantId, dateRanges),
            this.getInvoiceStats(tenantId),
            this.getComplianceStats(tenantId, dateRanges),
        ])

        return {
            tasks: {
                total: taskStats.total,
                pending: taskStats.pending,
                trend: this.calculateTrend(taskStats.total, taskStats.lastMonth),
            },
            bookings: {
                upcoming: bookingStats.upcoming,
                thisWeek: bookingStats.thisWeek,
                trend: this.calculateTrend(bookingStats.upcoming, bookingStats.lastMonth),
            },
            invoices: {
                outstanding: invoiceStats.outstanding,
                overdue: invoiceStats.overdue,
                total: invoiceStats.total,
            },
            compliance: {
                pending: complianceStats.pending,
                due: complianceStats.dueSoon,
                trend: this.calculateTrend(complianceStats.pending, complianceStats.lastMonth),
            },
        }
    }

    /**
     * Calculate date ranges for queries
     */
    private calculateDateRanges() {
        const now = new Date()
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        return { now, lastMonth, nextWeek }
    }

    /**
     * Get task statistics
     */
    private async getTaskStats(tenantId: string, { lastMonth }: { lastMonth: Date }) {
        const [total, pending, monthAgo] = await Promise.all([
            prisma.task.count({
                where: { tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
            }),
            prisma.task.count({
                where: { tenantId, status: 'OPEN' },
            }),
            prisma.task.count({
                where: { tenantId, createdAt: { gte: lastMonth } },
            }),
        ])

        return { total, pending, lastMonth: monthAgo }
    }

    /**
     * Get booking statistics
     */
    private async getBookingStats(
        tenantId: string,
        { now, lastMonth, nextWeek }: { now: Date; lastMonth: Date; nextWeek: Date }
    ) {
        const [upcoming, thisWeek, monthAgo] = await Promise.all([
            prisma.booking.count({
                where: { tenantId, scheduledAt: { gte: now }, status: 'CONFIRMED' },
            }),
            prisma.booking.count({
                where: {
                    tenantId,
                    scheduledAt: { gte: now, lte: nextWeek },
                    status: 'CONFIRMED',
                },
            }),
            prisma.booking.count({
                where: { tenantId, createdAt: { gte: lastMonth } },
            }),
        ])

        return { upcoming, thisWeek, lastMonth: monthAgo }
    }

    /**
     * Get invoice statistics
     */
    private async getInvoiceStats(tenantId: string) {
        const [outstanding, overdue, total] = await Promise.all([
            prisma.invoice.count({ where: { tenantId, status: 'UNPAID' } }),
            prisma.invoice.count({ where: { tenantId, status: 'VOID' } }),
            prisma.invoice.count({ where: { tenantId } }),
        ])

        return { outstanding, overdue, total }
    }

    /**
     * Get compliance statistics
     */
    private async getComplianceStats(
        tenantId: string,
        { now, lastMonth, nextWeek }: { now: Date; lastMonth: Date; nextWeek: Date }
    ) {
        const [pending, dueSoon, monthAgo] = await Promise.all([
            prisma.filingPeriod.count({
                where: {
                    obligation: { entity: { tenantId } },
                    status: 'UPCOMING',
                },
            }),
            prisma.filingPeriod.count({
                where: {
                    obligation: { entity: { tenantId } },
                    status: 'UPCOMING',
                    dueAt: { gte: now, lte: nextWeek },
                },
            }),
            prisma.filingPeriod.count({
                where: {
                    obligation: { entity: { tenantId } },
                    createdAt: { gte: lastMonth },
                },
            }),
        ])

        return { pending, dueSoon, lastMonth: monthAgo }
    }

    /**
     * Calculate trend percentage
     */
    private calculateTrend(current: number, previous: number): number {
        if (previous === 0) return 0
        return Number((((current - previous) / previous) * 100).toFixed(1))
    }
}

// Export singleton instance
export const portalOverviewService = new PortalOverviewService()
