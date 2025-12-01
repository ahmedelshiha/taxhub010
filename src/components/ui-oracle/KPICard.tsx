/**
 * KPICard Component - Oracle Fusion Inspired
 * Displays key performance indicator with trend and comparison
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface KPICardProps {
    label: string
    value: number | string
    trend?: number
    comparisonText?: string
    icon?: LucideIcon
    variant?: 'default' | 'info' | 'success' | 'warning' | 'danger'
    onClick?: () => void
    className?: string
}

const variantStyles = {
    default: 'border-gray-200 dark:border-gray-700',
    info: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20',
    success: 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20',
    warning: 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20',
    danger: 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20',
}

const iconStyles = {
    default: 'text-gray-600 dark:text-gray-400',
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-orange-600 dark:text-orange-400',
    danger: 'text-red-600 dark:text-red-400',
}

export function KPICard({
    label,
    value,
    trend,
    comparisonText,
    icon: Icon,
    variant = 'default',
    onClick,
    className,
}: KPICardProps) {
    const getTrendIcon = () => {
        if (trend === undefined || trend === 0) return Minus
        return trend > 0 ? TrendingUp : TrendingDown
    }

    const getTrendColor = () => {
        if (trend === undefined || trend === 0) return 'text-gray-500'
        return trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
    }

    const TrendIcon = getTrendIcon()

    return (
        <Card
            className={cn(
                variantStyles[variant],
                onClick && 'cursor-pointer transition-all hover:shadow-md',
                className
            )}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {label}
                </CardTitle>
                {Icon && (
                    <Icon className={cn('h-5 w-5', iconStyles[variant])} />
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        {trend !== undefined && (
                            <div className={cn('flex items-center gap-1', getTrendColor())}>
                                <TrendIcon className="h-3 w-3" />
                                <span className="font-medium">
                                    {Math.abs(trend).toFixed(1)}%
                                </span>
                            </div>
                        )}

                        {comparisonText && (
                            <span className="text-gray-500 dark:text-gray-400">
                                {comparisonText}
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
