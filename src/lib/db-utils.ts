/**
 * Database query optimization utilities
 * Helpers for efficient queries and caching
 */

/**
 * Batch database queries to reduce N+1 issues
 */
export function batchQueries<T, K>(
    ids: K[],
    fetchFn: (ids: K[]) => Promise<T[]>,
    batchSize: number = 50
): Promise<T[]> {
    const batches: K[][] = []

    for (let i = 0; i < ids.length; i += batchSize) {
        batches.push(ids.slice(i, i + batchSize))
    }

    return Promise.all(batches.map(batch => fetchFn(batch))).then(results =>
        results.flat()
    )
}

/**
 * Simple in-memory cache with TTL
 */
class QueryCache {
    private cache = new Map<string, { data: any; expires: number }>()

    set(key: string, data: any, ttlMs: number = 60000) {
        this.cache.set(key, {
            data,
            expires: Date.now() + ttlMs,
        })
    }

    get(key: string): any | null {
        const cached = this.cache.get(key)

        if (!cached) return null

        if (Date.now() > cached.expires) {
            this.cache.delete(key)
            return null
        }

        return cached.data
    }

    clear() {
        this.cache.clear()
    }

    delete(key: string) {
        this.cache.delete(key)
    }
}

export const queryCache = new QueryCache()

/**
 * Debounced database query
 */
export function debounceQuery<T>(
    fn: () => Promise<T>,
    delayMs: number = 300
): () => Promise<T> {
    let timeoutId: NodeJS.Timeout | null = null

    return () => {
        return new Promise((resolve, reject) => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }

            timeoutId = setTimeout(async () => {
                try {
                    const result = await fn()
                    resolve(result)
                } catch (error) {
                    reject(error)
                }
            }, delayMs)
        })
    }
}

/**
 * Pagination helper
 */
export interface PaginationOptions {
    page: number
    pageSize: number
}

export interface PaginatedResult<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasMore: boolean
}

export function paginate<T>(
    data: T[],
    options: PaginationOptions
): PaginatedResult<T> {
    const { page, pageSize } = options
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = data.slice(start, end)
    const total = data.length
    const totalPages = Math.ceil(total / pageSize)

    return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
    }
}

/**
 * Query builder helper for Prisma
 */
export function buildWhereClause(filters: Record<string, any>) {
    const where: any = {}

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return
        }

        if (typeof value === 'string') {
            where[key] = { contains: value, mode: 'insensitive' }
        } else if (Array.isArray(value)) {
            where[key] = { in: value }
        } else {
            where[key] = value
        }
    })

    return where
}
