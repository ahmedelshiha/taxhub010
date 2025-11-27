/**
 * Activity Tab Component - Refactored with Oracle Fusion UI
 * 
 * Modular architecture using:
 * - React Query (usePortalActivity)
 * - Oracle Fusion ContentSection
 * - RecentActivityWidget
 * - StatusMessage for errors
 * - LoadingSkeleton for loading
 * 
 * ~80 lines, production-ready
 */

'use client'

import { Button } from '@/components/ui/button'
import {
    ContentSection,
    LoadingSkeleton,
    StatusMessage,
} from '@/components/ui-oracle'
import { RecentActivityWidget, type ActivityItem } from '@/components/portal/widgets'
import { usePortalActivity } from '@/hooks/usePortalQuery'
import { Filter } from 'lucide-react'

export default function ActivityTab() {
    const { data, isLoading, error } = usePortalActivity()

    if (error) {
        return (
            <StatusMessage variant="error" title="Failed to load activity feed">
                {error.message || 'An error occurred while fetching activity data.'}
            </StatusMessage>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton variant="list" count={8} />
            </div>
        )
    }

    const activities = (data as any)?.data?.activities || []

    // Transform API data to widget format
    const activityItems: ActivityItem[] = activities.map((activity: any) => ({
        id: activity.id,
        type: (activity.type || 'system') as 'invoice' | 'document' | 'compliance' | 'system',
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp,
        status: activity.metadata?.status,
    }))

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Feed</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Recent updates and system events
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                </Button>
            </div>

            {/* Activity Widget */}
            <RecentActivityWidget
                activities={activityItems}
                loading={isLoading}
                maxItems={20}
            />

            {/* Info Message */}
            {activities.length > 0 && (
                <StatusMessage variant="info">
                    Activity feed refreshes automatically every minute to keep you updated with the latest events.
                </StatusMessage>
            )}
        </div>
    )
}
