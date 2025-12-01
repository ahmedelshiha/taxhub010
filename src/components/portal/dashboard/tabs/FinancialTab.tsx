/**
 * Financial Tab Component - Refactored with Oracle Fusion UI
 * 
 * Modular architecture using Oracle Fusion components
 * ~140 lines, production-ready
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
import { QuickActionsWidget } from '@/components/portal/widgets'
import { usePortalFinancial } from '@/hooks/usePortalQuery'
import { DollarSign, Receipt, AlertCircle, TrendingUp, CreditCard, Plus, FileText, Download, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface Invoice {
    id: string
    number: string
    client?: { name: string }
    amount: number
    status: string
    dueDate: string
}

export default function FinancialTab() {
    const router = useRouter()
    const { data, isLoading, error } = usePortalFinancial()

    if (error) {
        return (
            <StatusMessage variant="error" title="Failed to load financial data">
                {error.message || 'An error occurred while fetching financial information.'}
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

    const stats = (data as any)?.data?.stats || {
        totalRevenue: 0,
        outstandingInvoices: 0,
        overdueInvoices: 0,
        netIncome: 0,
        revenueTrend: 0,
    }

    const invoices = (data as any)?.data?.invoices || []

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount || 0)
    }

    const quickActions = [
        {
            id: 'view-reports',
            label: 'View Reports',
            icon: FileText,
            onClick: () => router.push('/portal/analytics'),
        },
        {
            id: 'download-summary',
            label: 'Download Summary',
            icon: Download,
            onClick: () => { },
        },
        {
            id: 'export-data',
            label: 'Export Data',
            icon: Upload,
            onClick: () => { },
            variant: 'outline' as const,
        },
    ]

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* KPI Stats */}
            <KPIGrid columns={4}>
                <KPICard
                    label="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    trend={stats.revenueTrend}
                    icon={DollarSign}
                    variant="success"
                />
                <KPICard
                    label="Outstanding"
                    value={stats.outstandingInvoices}
                    comparisonText="Invoices pending"
                    icon={Receipt}
                    variant="warning"
                />
                <KPICard
                    label="Overdue"
                    value={stats.overdueInvoices}
                    comparisonText="Needs followup"
                    icon={AlertCircle}
                    variant="danger"
                />
                <KPICard
                    label="Net Income"
                    value={formatCurrency(stats.netIncome)}
                    comparisonText="After expenses"
                    icon={TrendingUp}
                    variant="info"
                />
            </KPIGrid>

            {/* Recent Invoices */}
            <ContentSection title="Recent Invoices">
                {invoices.length === 0 ? (
                    <EmptyState
                        icon={Receipt}
                        title="No invoices found"
                        description="Create your first invoice to start tracking revenue."
                        action={{
                            label: 'Create Invoice',
                            onClick: () => router.push('/portal/invoicing/new'),
                        }}
                        variant="compact"
                    />
                ) : (
                    <div className="space-y-3">
                        {invoices.slice(0, 10).map((invoice: Invoice) => (
                            <div
                                key={invoice.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/portal/invoicing/${invoice.id}`)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            Invoice {invoice.number}
                                        </h3>
                                        <StatusBadge
                                            variant={
                                                invoice.status === 'OVERDUE'
                                                    ? 'danger'
                                                    : invoice.status === 'PAID'
                                                        ? 'success'
                                                        : 'warning'
                                            }
                                            size="sm"
                                            showDot
                                        >
                                            {invoice.status}
                                        </StatusBadge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {invoice.client?.name || 'No client'} • {formatCurrency(invoice.amount)}
                                        {invoice.dueDate && ` • Due ${formatDistanceToNow(new Date(invoice.dueDate), { addSuffix: true })}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ContentSection>

            {/* Quick Actions */}
            <QuickActionsWidget actions={quickActions} />
        </div>
    )
}
