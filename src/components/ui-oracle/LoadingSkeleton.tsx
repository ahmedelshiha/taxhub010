/**
 * LoadingSkeleton Component
 * Flexible skeleton loader with multiple variants
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface LoadingSkeletonProps {
    variant?: 'card' | 'table' | 'list' | 'text' | 'custom'
    count?: number
    className?: string
    children?: React.ReactNode
}

export function LoadingSkeleton({
    variant = 'card',
    count = 1,
    className
}: LoadingSkeletonProps) {
    switch (variant) {
        case 'card':
            return (
                <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6', className)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-3 w-32" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )

        case 'table':
            return (
                <div className={cn('space-y-3', className)}>
                    <Skeleton className="h-10 w-full" />
                    {Array.from({ length: count }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            )

        case 'list':
            return (
                <div className={cn('space-y-2', className)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )

        case 'text':
            return (
                <div className={cn('space-y-2', className)}>
                    {Array.from({ length: count }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
            )

        default:
            return <Skeleton className={className} />
    }
}
