/**
 * FilterChip - Removable Filter Tag
 * 
 * Small chip component representing an active filter:
 * - Label display
 * - Remove button
 * - Color variants
 * - Keyboard accessible
 */

import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FilterChipProps {
    /** Filter label to display */
    label: string

    /** Value of the filter */
    value: string

    /** Callback when chip is removed */
    onRemove: () => void

    /** Color variant */
    variant?: 'default' | 'primary' | 'secondary'

    /** Additional CSS classes */
    className?: string
}

const variantStyles = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200',
    primary: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
}

export function FilterChip({
    label,
    value,
    onRemove,
    variant = 'default',
    className,
}: FilterChipProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors',
                variantStyles[variant],
                className
            )}
        >
            <span className="flex items-center gap-1">
                <span className="text-xs opacity-75">{label}:</span>
                <span>{value}</span>
            </span>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-4 w-4 p-0 hover:bg-transparent"
                aria-label={`Remove ${label} filter`}
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    )
}
