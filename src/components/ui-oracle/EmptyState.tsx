/**
 * EmptyState Component
 * Display when no data is available
 */

import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    variant?: 'default' | 'compact'
    className?: string
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    variant = 'default',
    className
}: EmptyStateProps) {
    const isCompact = variant === 'compact'

    return (
        <div className={cn(
            'flex flex-col items-center justify-center text-center',
            isCompact ? 'py-6' : 'py-12',
            className
        )}>
            {Icon && (
                <div className={cn(
                    'rounded-full bg-gray-100 dark:bg-gray-800',
                    isCompact ? 'mb-3 p-3' : 'mb-4 p-4'
                )}>
                    <Icon className={cn(
                        'text-gray-400',
                        isCompact ? 'h-6 w-6' : 'h-8 w-8'
                    )} />
                </div>
            )}
            <h3 className={cn(
                'font-semibold text-gray-900 dark:text-white',
                isCompact ? 'text-base mb-0.5' : 'text-lg mb-1'
            )}>
                {title}
            </h3>
            {description && (
                <p className={cn(
                    'text-gray-600 dark:text-gray-400 max-w-sm',
                    isCompact ? 'text-xs mb-3' : 'text-sm mb-4'
                )}>
                    {description}
                </p>
            )}
            {action && (
                <Button
                    onClick={action.onClick}
                    size={isCompact ? 'sm' : 'default'}
                >
                    {action.label}
                </Button>
            )}
        </div>
    )
}
