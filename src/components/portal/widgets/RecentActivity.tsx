'use client'

import { ContentSection, EmptyState, LoadingSkeleton, StatusBadge } from '@/components/ui-oracle'
import { Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface ActivityItem {
    id: string
    type: 'invoice' | 'document' | 'compliance' | 'system'
    title: string
    description: string
    timestamp: string
    status?: string
}

export interface RecentActivityWidgetProps {
    activities: ActivityItem[]
    loading?: boolean
    maxItems?: number
}

export function RecentActivityWidget({ activities, loading, maxItems = 5 }: RecentActivityWidgetProps) {
    if (loading) return <LoadingSkeleton variant="list" count={3} />

    if (activities.length === 0) {
        return (
            <ContentSection title="Recent Activity">
                <EmptyState
                    icon={Clock}
                    title="No recent activity"
                    description="Your recent actions will appear here"
                />
            </ContentSection>
        )
    }

    const displayActivities = activities.slice(0, maxItems)

    return (
        <ContentSection title="Recent Activity">
            <div className="space-y-4">
                {displayActivities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 items-start pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                        <div className="mt-1">
                            {activity.type === 'invoice' && <FileText className="h-5 w-5 text-blue-500" />}
                            {activity.type === 'compliance' && <AlertCircle className="h-5 w-5 text-orange-500" />}
                            {activity.type === 'document' && <FileText className="h-5 w-5 text-purple-500" />}
                            {activity.type === 'system' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-400">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </span>
                                {activity.status && (
                                    <StatusBadge variant="neutral" size="sm">{activity.status}</StatusBadge>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ContentSection>
    )
}
