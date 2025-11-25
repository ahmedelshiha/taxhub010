/**
 * Edge case handling utilities
 * Empty states, error boundaries, and fallbacks
 */

import { ReactNode } from 'react'

/**
 * Empty state props
 */
export interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description?: string
    action?: ReactNode
    className?: string
}

/**
 * Reusable empty state component configuration
 */
export const emptyStates = {
    noTasks: {
        title: 'No tasks yet',
        description: 'Create your first task to get started',
    },
    noBookings: {
        title: 'No bookings',
        description: 'Schedule a booking to begin',
    },
    noNotifications: {
        title: 'All caught up!',
        description: 'No new notifications',
    },
    noMessages: {
        title: 'No messages',
        description: 'Start a conversation',
    },
    noResults: {
        title: 'No results found',
        description: 'Try adjusting your search',
    },
    noData: {
        title: 'No data available',
        description: 'Data will appear here once available',
    },
    error: {
        title: 'Something went wrong',
        description: 'Please try again later',
    },
}

/**
 * Safe array access
 */
export function safeArrayAccess<T>(arr: T[] | undefined | null, index: number): T | undefined {
    if (!arr || !Array.isArray(arr)) return undefined
    if (index < 0 || index >= arr.length) return undefined
    return arr[index]
}

/**
 * Safe object property access
 */
export function safeGet<T, K extends keyof T>(
    obj: T | undefined | null,
    key: K
): T[K] | undefined {
    if (!obj || typeof obj !== 'object') return undefined
    return obj[key]
}

/**
 * Format large numbers (1000 -> 1K, 1000000 -> 1M)
 */
export function formatLargeNumber(num: number): string {
    if (num < 1000) return num.toString()
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`
    return `${(num / 1000000000).toFixed(1)}B`
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
}

/**
 * Handle API errors gracefully
 */
export function handleApiError(error: any): string {
    if (error.response?.data?.message) {
        return error.response.data.message
    }

    if (error.message) {
        return error.message
    }

    return 'An unexpected error occurred'
}

/**
 * Retry failed operations
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: any

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error

            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
            }
        }
    }

    throw lastError
}

/**
 * Check if value is empty (null, undefined, '', [], {})
 */
export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string' && value.trim() === '') return true
    if (Array.isArray(value) && value.length === 0) return true
    if (typeof value === 'object' && Object.keys(value).length === 0) return true
    return false
}

/**
 * Pluralize text based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) return singular
    return plural || `${singular}s`
}
