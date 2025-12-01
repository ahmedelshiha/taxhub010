/**
 * Compliance Service
 * Business logic for compliance obligations and filing periods
 * Extracted from API routes for reusability and testing
 */

import { prisma } from '@/lib/prisma'
import { BaseService } from '@/services/shared/base.service'

export interface ComplianceStats {
    total: number
    upcoming: number
    dueSoon: number
    missed: number
    completed: number
}

export interface ComplianceItem {
    id: string
    title: string
    type: string
    dueDate: string
    status: 'OVERDUE' | 'PENDING' | 'COMPLETED'
    entity: {
        id: string
        name: string
    }
    filingPeriod: {
        startDate: string
        endDate: string
    }
}

export class ComplianceService extends BaseService {
    /**
     * Get compliance dashboard data (stats and upcoming items)
     */
    async getDashboardData(tenantId: string) {
        const now = new Date()
        const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        // Fetch compliance items (FilingPeriods) and stats in parallel
        const [items, totalCount, upcomingCount, dueSoonCount, missedCount, completedCount] = await Promise.all([
            prisma.filingPeriod.findMany({
                where: {
                    obligation: { entity: { tenantId } },
                    OR: [
                        { status: 'MISSED' },
                        {
                            status: 'UPCOMING',
                            dueAt: { lte: next30Days },
                        },
                    ],
                },
                take: 20,
                orderBy: [
                    { dueAt: 'asc' },
                ],
                include: {
                    obligation: {
                        include: {
                            entity: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.filingPeriod.count({
                where: { obligation: { entity: { tenantId } } },
            }),
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
                    dueAt: {
                        gte: now,
                        lte: next30Days,
                    },
                },
            }),
            prisma.filingPeriod.count({
                where: {
                    obligation: { entity: { tenantId } },
                    status: 'MISSED',
                },
            }),
            prisma.filingPeriod.count({
                where: {
                    obligation: { entity: { tenantId } },
                    status: 'FILED',
                },
            }),
        ])

        // Transform items to match expected format
        const transformedItems: ComplianceItem[] = items.map(item => ({
            id: item.id,
            title: `${item.obligation.type} - ${item.obligation.country}`,
            type: item.obligation.type,
            dueDate: item.dueAt.toISOString(),
            status: item.status === 'MISSED' ? 'OVERDUE' : 'PENDING',
            entity: item.obligation.entity,
            filingPeriod: {
                startDate: item.periodStart.toISOString(),
                endDate: item.periodEnd.toISOString(),
            },
        }))

        const stats: ComplianceStats = {
            total: totalCount,
            upcoming: upcomingCount,
            dueSoon: dueSoonCount,
            missed: missedCount,
            completed: completedCount,
        }

        return {
            items: transformedItems,
            stats,
        }
    }
}

// Export singleton instance
export const complianceService = new ComplianceService()
