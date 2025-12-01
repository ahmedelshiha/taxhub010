/**
 * TrendIndicator - Oracle Fusion Style Trend Display
 * 
 * Shows trend with:
 * - Up/down/neutral arrows
 * - Percentage value
 * - Color coding (green=up, red=down, gray=neutral)
 * - Multiple sizes
 */

import React from 'react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TrendIndicatorProps {
    /** Trend value as percentage (e.g., 12.5 for +12.5%) */
    value: number

    /** Size variant */
    size?: 'sm' | 'md' | 'lg'

    /** Show sign (+/-) */
    showSign?: boolean

    /** Reverse color logic (red for positive, green for negative) */
    inverse?: boolean

    /** Additional CSS classes */
    className?: string
}

const sizes = {
    sm: {
        icon: 'h-3 w-3',
        text: 'text-xs',
    },
    md: {
        icon: 'h-4 w-4',
        text: 'text-sm',
    },
    lg: {
        icon: 'h-5 w-5',
        text: 'text-base',
    },
}

export function TrendIndicator({
    value,
    size = 'md',
    showSign = false,
    inverse = false,
    className,
}: TrendIndicatorProps) {
    const isPositive = value > 0
    const isNegative = value < 0
    const isNeutral = value === 0

    const colorClass = isNeutral
        ? 'text-gray-500 dark:text-gray-400'
        : (isPositive && !inverse) || (isNegative && inverse)
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'

    const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus

    const displayValue = Math.abs(value).toFixed(1)
    const sign = showSign && !isNeutral ? (isPositive ? '+' : '-') : ''

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 font-medium',
                colorClass,
                sizes[size].text,
                className
            )}
        >
            <Icon className={sizes[size].icon} />
            {sign}{displayValue}%
        </span>
    )
}
