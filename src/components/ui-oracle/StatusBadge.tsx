/**
 * StatusBadge Component
 * Status indicator badge
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusVariant =
    | 'default'
    | 'success'
    | 'warning'
    | 'error'
    | 'danger'
    | 'info'
    | 'pending'
    | 'neutral'

export type BadgeSize = 'sm' | 'md' | 'lg'

export interface StatusBadgeProps {
    status?: string
    children?: React.ReactNode
    variant?: StatusVariant
    size?: BadgeSize
    showDot?: boolean
    className?: string
}

const variantStyles: Record<StatusVariant, string> = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200',
    warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200',
}

const dotStyles: Record<StatusVariant, string> = {
    default: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    error: 'bg-red-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    pending: 'bg-yellow-500',
    neutral: 'bg-gray-500',
}

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
}

export function StatusBadge({
    status,
    children,
    variant = 'default',
    size = 'md',
    showDot = false,
    className
}: StatusBadgeProps) {
    return (
        <Badge
            className={cn(
                variantStyles[variant],
                sizeStyles[size],
                'gap-1.5',
                className
            )}
            variant="outline"
        >
            {showDot && (
                <span className={cn('h-1.5 w-1.5 rounded-full', dotStyles[variant])} />
            )}
            {children || status}
        </Badge>
    )
}
