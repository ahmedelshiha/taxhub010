/**
 * Overview Tab Component - Refactored with Oracle Fusion UI
 * 
 * Modular architecture using:
 * - React Query for data fetching (instead of SWR)
 * - Oracle Fusion KPICard/Grid (instead of custom StatCard)
 * - StatusMessage for errors (instead of custom Card)
 * - LoadingSkeleton for loading states
 * - ContentSection for layout
 * 
 * ~100 lines, production-ready
 */

'use client'

import {
    KPICard,
    KPIGrid,
    ContentSection,
    LoadingSkeleton,
    StatusMessage,
} from '@/components/ui-oracle'
import { usePortalOverview } from '@/hooks/usePortalQuery'
import {
    CheckSquare,
    Calendar,
    DollarSign,
    AlertCircle,
} from 'lucide-react'
import { DashboardCustomizer, WidgetConfig } from '../DashboardCustomizer'
import { usePortalWidgetPreferences } from '@/stores/portal/layout.store'

const WIDGETS: WidgetConfig[] = [
    { id: 'tasks', label: 'Active Tasks', description: 'Pending tasks requiring attention' },
    { id: 'bookings', label: 'Upcoming Bookings', description: 'Scheduled appointments this week' },
    { id: 'invoices', label: 'Outstanding Invoices', description: 'Unpaid and overdue invoices' },
    { id: 'compliance', label: 'Compliance Items', description: 'Upcoming filing deadlines' },
]

interface DashboardStats {
    tasks: { total: number; pending: number; trend: number }
    bookings: { upcoming: number; thisWeek: number; trend: number }
    invoices: { outstanding: number; overdue: number; total: number }
    compliance: { pending: number; due: number; trend: number }
}

export default function OverviewTab() {
    // Use React Query hook (stale-while-revalidate, automatic retry)
    const { data, isLoading, error } = usePortalOverview()
    const preferences = usePortalWidgetPreferences()

    // Error state with StatusMessage
    if (error) {
        return (
            <StatusMessage variant="error" title="Failed to load overview data">
                {error.message || 'An error occurred while fetching dashboard data. Please try again.'}
            </StatusMessage>
        )
    }

    // Loading state with Oracle Fusion LoadingSkeleton
    if (isLoading) {
        return <LoadingSkeleton variant="card" count={4} />
    }

    const stats = (data as any)?.data as DashboardStats | undefined

    const isWidgetVisible = (id: string) => preferences[id]?.visible ?? true

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-end">
                <DashboardCustomizer widgets={WIDGETS} />
            </div>

            {/* KPI Metrics with Oracle Fusion KPICard/Grid */}
            <KPIGrid columns={4}>
                {isWidgetVisible('tasks') && (
                    <KPICard
                        label="Active Tasks"
                        value={stats?.tasks.total || 0}
                        trend={stats?.tasks.trend}
                        comparisonText={`${stats?.tasks.pending || 0} pending`}
                        icon={CheckSquare}
                        variant="info"
                    />
                )}

                {isWidgetVisible('bookings') && (
                    <KPICard
                        label="Upcoming Bookings"
                        value={stats?.bookings.upcoming || 0}
                        trend={stats?.bookings.trend}
                        comparisonText={`${stats?.bookings.thisWeek || 0} this week`}
                        icon={Calendar}
                        variant="success"
                    />
                )}

                {isWidgetVisible('invoices') && (
                    <KPICard
                        label="Outstanding Invoices"
                        value={stats?.invoices.outstanding || 0}
                        trend={
                            stats?.invoices.total
                                ? ((stats.invoices.outstanding / stats.invoices.total) * 100 - 100)
                                : 0
                        }
                        comparisonText={`${stats?.invoices.overdue || 0} overdue`}
                        icon={DollarSign}
                        variant="warning"
                    />
                )}

                {isWidgetVisible('compliance') && (
                    <KPICard
                        label="Compliance Items"
                        value={stats?.compliance.pending || 0}
                        trend={stats?.compliance.trend}
                        comparisonText={`${stats?.compliance.due || 0} due soon`}
                        icon={AlertCircle}
                        variant={stats?.compliance.due && stats.compliance.due > 0 ? 'danger' : 'default'}
                    />
                )}
            </KPIGrid>

            {/* Welcome Section with ContentSection */}
            <ContentSection
                title="Welcome to TaxHub Portal"
                description="Your professional dashboard for managing compliance, financials, and business operations."
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the sidebar to navigate to different sections, or switch tabs above for detailed views.
                    All data is refreshed automatically to keep you up to date.
                </p>
            </ContentSection>
        </div>
    )
}
