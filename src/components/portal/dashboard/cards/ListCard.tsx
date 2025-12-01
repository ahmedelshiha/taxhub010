/**
 * List Card Component
 * Reusable card for displaying lists of items (~80 lines)
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ListItem {
    id: string
    title: string
    subtitle?: string
    badge?: {
        label: string
        variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    }
    href?: string
    metadata?: string
}

interface ListCardProps {
    title: string
    icon?: LucideIcon
    items: ListItem[]
    emptyMessage?: string
    viewAllHref?: string
    maxItems?: number
    onItemClick?: (item: ListItem) => void
}

export default function ListCard({
    title,
    icon: Icon,
    items,
    emptyMessage = 'No items to display',
    viewAllHref,
    maxItems = 5,
    onItemClick
}: ListCardProps) {
    const displayItems = items.slice(0, maxItems)

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        {Icon && <Icon className="h-5 w-5" />}
                        {title}
                    </CardTitle>
                    {viewAllHref && items.length > 0 && (
                        <Link href={viewAllHref}>
                            <Button variant="ghost" size="sm">
                                View All
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {displayItems.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        {emptyMessage}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {displayItems.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    'flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700',
                                    'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                                    (item.href || onItemClick) && 'cursor-pointer'
                                )}
                                onClick={() => onItemClick?.(item)}
                            >
                                <div className="flex-1 min-w-0">
                                    {item.href ? (
                                        <Link href={item.href} className="block">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {item.title}
                                            </p>
                                            {item.subtitle && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {item.subtitle}
                                                </p>
                                            )}
                                        </Link>
                                    ) : (
                                        <>
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {item.title}
                                            </p>
                                            {item.subtitle && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {item.subtitle}
                                                </p>
                                            )}
                                        </>
                                    )}
                                    {item.metadata && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {item.metadata}
                                        </p>
                                    )}
                                </div>
                                {item.badge && (
                                    <Badge variant={item.badge.variant || 'secondary'}>
                                        {item.badge.label}
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
