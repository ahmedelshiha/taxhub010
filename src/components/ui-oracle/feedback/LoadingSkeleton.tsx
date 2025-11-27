/**
 * LoadingSkeleton - Oracle Fusion Style Loading Skeletons
 * 
 * Consistent loading skeletons for different layouts:
 * - Card skeleton
 * - Table skeleton
 * - List skeleton
 * - Custom skeleton
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingSkeletonProps {
    /** Skeleton variant */
    variant?: 'card' | 'table' | 'list' | 'custom'

    /** Number of items to show */
    count?: number

    /** Additional CSS classes */
    className?: string

    /** Custom skeleton children (for variant='custom') */
    children?: React.ReactNode
}

export function LoadingSkeleton({
    variant = 'card',
    count = 1,
    className,
    children,
}: LoadingSkeletonProps) {
    if (variant === 'custom') {
        return (
            <div className={cn('animate-pulse', className)}>
                {children}
            </div>
        )
    }

    const items = Array.from({ length: count }, (_, i) => i)

    if (variant === 'card') {
        return (
            <div className={cn('space-y-4', className)}>
                {items.map((i) => (
                    <div
                        key={i}
                        className="animate-pulse bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4"
                    >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    </div>
                ))}
            </div>
        )
    }

    if (variant === 'table') {
        return (
            <div className={cn('animate-pulse space-y-3', className)}>
                {/* Table header */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    ))}
                </div>
                {/* Table rows */}
                {items.map((i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        ))}
                    </div>
                ))}
            </div>
        )
    }

    if (variant === 'list') {
        return (
            <div className={cn('space-y-3', className)}>
                {items.map((i) => (
                    <div
                        key={i}
                        className="animate-pulse flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return null
}
