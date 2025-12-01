/**
 * TrendIndicator Component
 * Visual trend indicator with arrow
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TrendIndicatorProps {
    value: number
    showValue?: boolean
    className?: string
}

export function TrendIndicator({ value, showValue = true, className }: TrendIndicatorProps) {
    const getIcon = () => {
        if (value > 0) return TrendingUp
        if (value < 0) return TrendingDown
        return Minus
    }

    const getColor = () => {
        if (value > 0) return 'text-green-600 dark:text-green-400'
        if (value < 0) return 'text-red-600 dark:text-red-400'
        return 'text-gray-500 dark:text-gray-400'
    }

    const Icon = getIcon()

    return (
        <div className={cn('flex items-center gap-1', getColor(), className)}>
            <Icon className="h-4 w-4" />
            {showValue && (
                <span className="text-sm font-medium">
                    {Math.abs(value).toFixed(1)}%
                </span>
            )}
        </div>
    )
}
