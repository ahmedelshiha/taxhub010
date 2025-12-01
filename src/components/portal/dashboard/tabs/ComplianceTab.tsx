/**
 * Compliance Tab Component - Refactored with Oracle Fusion UI
 * 
 * Modular architecture using Oracle Fusion components
 * ~130 lines, production-ready
 */

'use client'

import { Button } from '@/components/ui/button'
import {
    KPICard,
    KPIGrid,
    ContentSection,
    LoadingSkeleton,
    StatusMessage,
    StatusBadge,
    EmptyState,
} from '@/components/ui-oracle'
import { usePortalCompliance } from '@/hooks/usePortalQuery'
import { AlertCircle, Clock, CheckCircle, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface ComplianceItem {
    id: string
    title: string
    type: string
    dueDate: string
    status: string
    entity?: { name: string }
}

export default function ComplianceTab() {
    const router = useRouter()
    const { data, isLoading, error } = usePortalCompliance()

    if (error) {
        return (
            <StatusMessage variant="error" title="Failed to load compliance data">
                {error.message || 'An error occurred while fetching compliance information.'}
            </StatusMessage>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton variant="card" count={4} />
                <LoadingSkeleton variant="list" count={5} />
            </div>
        )
    }

    const stats = (data as any)?.data?.stats || { total: 0, pending: 0, dueSoon: 0, overdue: 0 }
    const items = (data as any)?.data?.items || []

    const urgentItems = items
        .filter((item: ComplianceItem) => item.status === 'OVERDUE' || item.status === 'PENDING')
        .slice(0, 10)

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2">
                <Button onClick={() => router.push('/portal/compliance')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                </Button>
            </div>

            {/* KPI Stats */}
            <KPIGrid columns={4}>
                <KPICard
                    label="Total Obligations"
                    value={stats.total}
                    icon={AlertCircle}
                    variant="info"
                />
                <KPICard
                    label="Pending"
                    value={stats.pending}
                    comparisonText="Awaiting action"
                    icon={Clock}
                    variant="warning"
                />
                <KPICard
                    label="Due Soon"
                    value={stats.dueSoon}
                    comparisonText="Next 30 days"
                    icon={AlertCircle}
                    variant="warning"
                />
                <KPICard
                    label="Overdue"
                    value={stats.overdue}
                    comparisonText="Needs attention"
                    icon={AlertCircle}
                    variant="danger"
                />
            </KPIGrid>

            {/* Urgent Items */}
            <ContentSection title="Urgent Compliance Items">
                {urgentItems.length === 0 ? (
                    <EmptyState
                        icon={CheckCircle}
                        title="All compliance items are up to date!"
                        description="You have no urgent compliance obligations at this time."
                        variant="compact"
                    />
                ) : (
                    <div className="space-y-3">
                        {urgentItems.map((item: ComplianceItem) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/portal/compliance/${item.id}`)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                            {item.title}
                                        </h3>
                                        <StatusBadge
                                            variant={item.status === 'OVERDUE' ? 'danger' : 'warning'}
                                            size="sm"
                                            showDot
                                        >
                                            {item.status === 'OVERDUE' ? 'Overdue' : 'Due Soon'}
                                        </StatusBadge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.entity?.name || 'No entity'} • Due {format(new Date(item.dueDate), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ContentSection>

            {/* Info Message */}
            <StatusMessage variant="info" title="Stay Compliant">
                Set up automatic reminders and notifications to never miss a deadline.
                Visit the compliance center for full details.
            </StatusMessage>
        </div>
    )
}
