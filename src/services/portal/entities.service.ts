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
}

export class EntitiesService extends BaseService {
    /**
     * List active entities for a tenant
     */
    async listActiveEntities(tenantId: string): Promise<EntityListItem[]> {
        const entities = await prisma.entity.findMany({
            where: {
                tenantId,
                // Only show active entities
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
