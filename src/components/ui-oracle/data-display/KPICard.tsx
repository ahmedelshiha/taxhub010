/**
 * KPICard - Oracle Fusion Style Metric Display
 * 
 * A card component for displaying key performance indicators with:
 * - Main value with formatting
 * - Trend indicator (up/down)
 * - Comparison text
 * - Optional icon
 * - Color variants for status
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KPICardProps {
    /** Display label for the metric */
    label: string

    /** Primary value to display */
    value: string | number

    /** Trend percentage (e.g., 12.5 for +12.5%) */
    trend?: number

    /** Comparison text (e.g., "vs last month") */
    comparisonText?: string

    /** Icon to display */
    icon?: LucideIcon

    /** Color variant */
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'

    /** Loading state */
    loading?: boolean

    /** Click handler */
    onClick?: () => void

    /** Additional CSS classes */
    className?: string
}

const variantStyles = {
    default: 'border-gray-200 dark:border-gray-700',
    success: 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20',
    warning: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/30 dark:bg-yellow-950/20',
    danger: 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20',
    info: 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20',
}

const variantTextColors = {
    default: 'text-gray-900 dark:text-gray-100',
    success: 'text-green-900 dark:text-green-100',
    warning: 'text-yellow-900 dark:text-yellow-100',
    danger: 'text-red-900 dark:text-red-100',
    info: 'text-blue-900 dark:text-blue-100',
}

export function KPICard({
    label,
    value,
    trend,
    comparisonText,
    icon: Icon,
    variant = 'default',
    loading = false,
    onClick,
    className,
}: KPICardProps) {
    const isPositiveTrend = trend !== undefined && trend > 0
    const isNegativeTrend = trend !== undefined && trend < 0
    const isNeutralTrend = trend !== undefined && trend === 0

    const TrendIcon = isPositiveTrend ? ArrowUp : isNegativeTrend ? ArrowDown : Minus

    return (
        <Card
            className={cn(
                'transition-all duration-200',
                variantStyles[variant],
                onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-6">
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                    </div>
                ) : (
                    <>
                        {/* Header with label and icon */}
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {label}
                            </p>
                            {Icon && (
                                <Icon className={cn('h-5 w-5', variantTextColors[variant])} />
                            )}
                        </div>

                        {/* Main value */}
                        <div className={cn('text-3xl font-bold mb-2', variantTextColors[variant])}>
                            {value}
                        </div>

                        {/* Trend and comparison */}
                        {(trend !== undefined || comparisonText) && (
                            <div className="flex items-center gap-2 text-sm">
                                {trend !== undefined && (
                                    <span
                                        className={cn(
                                            'flex items-center gap-1 font-medium',
                                            isPositiveTrend && 'text-green-600 dark:text-green-400',
                                            isNegativeTrend && 'text-red-600 dark:text-red-400',
                                            isNeutralTrend && 'text-gray-500 dark:text-gray-400'
                                        )}
                                    >
                                        <TrendIcon className="h-4 w-4" />
                                        {Math.abs(trend).toFixed(1)}%
                                    </span>
                                )}
                                {comparisonText && (
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {comparisonText}
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
