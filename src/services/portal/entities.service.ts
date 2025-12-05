/**
 * Entities Service
 * Business logic for entity management
 * Extracted from API routes for reusability and testing
 */

import { prisma } from '@/lib/prisma'
import { BaseService } from '@/services/shared/base.service'

export interface EntityListItem {
    id: string
    name: string
    status: string
    country: string
    legalForm?: string
    createdAt?: string
    approvalStatus?: string
}

export class EntitiesService extends BaseService {
    /**
     * List all entities for a tenant (including pending)
     */
    async listAllEntities(tenantId: string): Promise<EntityListItem[]> {
        const entities = await prisma.entity.findMany({
            where: {
                tenantId,
            },
            select: {
                id: true,
                name: true,
                status: true,
                country: true,
                legalForm: true,
                createdAt: true,
                approval: {
                    select: {
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return entities.map(e => ({
            id: e.id,
            name: e.name,
            status: e.approval?.status || e.status,
            country: e.country,
            legalForm: e.legalForm || undefined,
            createdAt: e.createdAt?.toISOString(),
            approvalStatus: e.approval?.status || undefined,
        }))
    }

    /**
     * List active entities only (legacy method)
     */
    async listActiveEntities(tenantId: string): Promise<EntityListItem[]> {
        const entities = await prisma.entity.findMany({
            where: {
                tenantId,
                OR: [
                    { status: 'ACTIVE' },
                    { status: 'VERIFIED' },
                ],
            },
            select: {
                id: true,
                name: true,
                status: true,
                country: true,
            },
            orderBy: {
                name: 'asc',
            },
        })

        return entities
    }
}

// Export singleton instance
export const entitiesService = new EntitiesService()

