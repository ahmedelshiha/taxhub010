/**
 * Stat Card Component
 * Reusable metric display card (~60 lines)
 */

'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: number | string
    subtitle?: string
    icon: LucideIcon
    trend?: number
    color?: string
    onClick?: () => void
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'text-blue-600',
    onClick
}: StatCardProps) {
    return (
        <Card
            className={cn(
                'card-hover',
                onClick && 'cursor-pointer hover:border-blue-300'
            )}
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {title}
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className={cn(
                        'p-3 rounded-full bg-gray-100 dark:bg-gray-800',
                        color
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>

                {trend !== undefined && trend !== 0 && (
                    <div className={cn(
                        'flex items-center gap-1 mt-3 text-sm',
                        trend > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                        {trend > 0 ? (
                            <>
                                <TrendingUp className="h-4 w-4" />
                                <span>+{trend.toFixed(1)}%</span>
                            </>
                        ) : (
                            <>
                                <TrendingDown className="h-4 w-4" />
                                <span>{trend.toFixed(1)}%</span>
                            </>
                        )}
                        <span className="text-gray-500 dark:text-gray-400">vs last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
