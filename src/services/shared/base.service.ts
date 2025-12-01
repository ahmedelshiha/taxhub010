/**
 * Service Base Utilities
 * Common utilities and helpers for service layer
 */

import { prisma } from '@/lib/prisma'

/**
 * Base service error class
 */
export class ServiceError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public details?: any
    ) {
        super(message)
        this.name = 'ServiceError'
    }
}

/**
 * Not found error
 */
export class NotFoundError extends ServiceError {
    constructor(resource: string, id?: string) {
        super(
            id ? `${resource} with id ${id} not found` : `${resource} not found`,
            'NOT_FOUND',
            404
        )
        this.name = 'NotFoundError'
    }
}

/**
 * Validation error
 */
export class ValidationError extends ServiceError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', 400, details)
        this.name = 'ValidationError'
    }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends ServiceError {
    constructor(message: string = 'Unauthorized') {
        super(message, 'UNAUTHORIZED', 401)
        this.name = 'UnauthorizedError'
    }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends ServiceError {
    constructor(message: string = 'Forbidden') {
        super(message, 'FORBIDDEN', 403)
        this.name = 'ForbiddenError'
    }
}

/**
 * Base service class with common utilities
 */
export abstract class BaseService {
    protected prisma = prisma

    /**
     * Get or throw not found
     */
    protected async getOrThrow<T>(
        promise: Promise<T | null>,
        resource: string,
        id?: string
    ): Promise<T> {
        const result = await promise
        if (!result) {
            throw new NotFoundError(resource, id)
        }
        return result
    }

    /**
     * Validate tenant access
     */
    protected validateTenantAccess(resourceTenantId: string, userTenantId: string) {
        if (resourceTenantId !== userTenantId) {
            throw new ForbiddenError('Access denied to this resource')
        }
    }

    /**
     * Validate admin role
     */
    protected validateAdminRole(role: string, tenantRole?: string | null) {
        if (role !== 'SUPER_ADMIN' && !tenantRole?.includes('ADMIN')) {
            throw new ForbiddenError('Admin access required')
        }
    }

    /**
     * Paginate results
     */
    protected async paginate<T>(
        query: {
            where: any
            include?: any
            orderBy?: any
        },
        model: any,
        limit: number = 20,
        offset: number = 0
    ): Promise<{
        data: T[]
        meta: {
            total: number
            limit: number
            offset: number
            hasMore: boolean
        }
    }> {
        const [total, data] = await Promise.all([
            model.count({ where: query.where }),
            model.findMany({
                where: query.where,
                include: query.include,
                orderBy: query.orderBy,
                skip: offset,
                take: limit,
            }),
        ])

        return {
            data,
            meta: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        }
    }
}

/**
 * Transaction wrapper for service methods
 */
export async function withTransaction<T>(
    callback: (tx: typeof prisma) => Promise<T>
): Promise<T> {
    return await prisma.$transaction(async (tx) => {
        return await callback(tx as typeof prisma)
    })
}

/**
 * Retry wrapper for service methods
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error as Error

            if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
            }
        }
    }

    throw lastError || new Error('Operation failed after retries')
}
