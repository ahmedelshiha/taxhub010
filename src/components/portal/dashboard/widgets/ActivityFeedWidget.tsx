import React from 'react'
import { WidgetContainer } from '../WidgetContainer'
import { Activity, FileText, User, Settings, CreditCard, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItem {
    id: string
    type: 'document' | 'profile' | 'billing' | 'booking' | 'system'
    description: string
    timestamp: string
    user?: string
}

interface ActivityFeedWidgetProps {
    activities: ActivityItem[]
    loading?: boolean
    error?: string
}

const typeIcons = {
    document: FileText,
    profile: User,
    billing: CreditCard,
    booking: Calendar,
    system: Settings,
}

const typeColors = {
    document: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    profile: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    billing: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    booking: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    system: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export function ActivityFeedWidget({ activities, loading, error }: ActivityFeedWidgetProps) {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return date.toLocaleDateString()
    }

    return (
        <WidgetContainer
            title="Recent Activity"
            icon={<Activity className="h-5 w-5" />}
            loading={loading}
            error={error}
        >
            {activities.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500">
                    No recent activity
                </div>
            ) : (
                <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-700">
                    {activities.slice(0, 5).map((activity) => {
                        const Icon = typeIcons[activity.type] || Activity
                        return (
                            <div key={activity.id} className="relative pl-10">
                                <div className={cn(
                                    "absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900",
                                    typeColors[activity.type]
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTime(activity.timestamp)}
                                        </span>
                                        {activity.user && (
                                            <>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {activity.user}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </WidgetContainer>
    )
}
