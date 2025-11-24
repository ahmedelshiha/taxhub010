import React from 'react'
import { WidgetContainer } from '../WidgetContainer'
import { TrendingUp, TrendingDown, DollarSign, ArrowRight, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import useSWR from 'swr'

interface FinancialData {
    currentMonth: {
        invoicesTotal: number
        invoicesPaid: number
        invoicesUnpaid: number
        expensesPending: number
        expensesApproved: number
    }
    previousMonth: {
        invoicesTotal: number
        invoicesPaid: number
        invoicesUnpaid: number
        expensesPending: number
        expensesApproved: number
    }
}

interface FinancialOverviewWidgetProps {
    className?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

const calculateChange = (current: number, previous: number): { percent: number; isPositive: boolean; isNeutral: boolean } => {
    if (previous === 0) {
        return { percent: current > 0 ? 100 : 0, isPositive: current > 0, isNeutral: current === 0 }
    }
    const percent = ((current - previous) / previous) * 100
    return {
        percent: Math.abs(percent),
        isPositive: percent > 0,
        isNeutral: percent === 0
    }
}

export function FinancialOverviewWidget({ className }: FinancialOverviewWidgetProps) {
    const { data, error, isLoading } = useSWR<{
        success: boolean
        data: FinancialData
    }>(
        '/api/portal/financial-summary',
        fetcher,
        {
            refreshInterval: 300000, // Refresh every 5 minutes
            revalidateOnFocus: true,
        }
    )

    const financialData = data?.data
    const hasError = error || (data && !data.success)

    // Calculate changes
    const invoiceChange = financialData
        ? calculateChange(
            financialData.currentMonth.invoicesTotal,
            financialData.previousMonth.invoicesTotal
        )
        : null

    const paidChange = financialData
        ? calculateChange(
            financialData.currentMonth.invoicesPaid,
            financialData.previousMonth.invoicesPaid
        )
        : null

    return (
        <WidgetContainer
            title="Financial Overview"
            icon={<DollarSign className="h-5 w-5" />}
            loading={isLoading}
            error={hasError ? 'Failed to load financial data' : undefined}
            action={
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                    <Link href="/portal/reports">
                        View Reports <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            }
            className={className}
        >
            {!financialData ? (
                <div className="h-full flex items-center justify-center text-center p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No financial data available</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Current Month Header */}
                    <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            This Month
                        </p>
                    </div>

                    {/* Invoices Section */}
                    <div className="space-y-3">
                        {/* Total Invoices */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Invoices</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                    {formatCurrency(financialData.currentMonth.invoicesTotal)}
                                </p>
                            </div>
                            {invoiceChange && (
                                <div className={cn(
                                    "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                                    invoiceChange.isNeutral
                                        ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                        : invoiceChange.isPositive
                                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                )}>
                                    {invoiceChange.isNeutral ? (
                                        <Minus className="h-3 w-3" />
                                    ) : invoiceChange.isPositive ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    {invoiceChange.percent.toFixed(0)}%
                                </div>
                            )}
                        </div>

                        {/* Paid vs Unpaid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                                <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Paid</p>
                                <p className="text-lg font-bold text-green-900 dark:text-green-300">
                                    {formatCurrency(financialData.currentMonth.invoicesPaid)}
                                </p>
                                {paidChange && (
                                    <p className="text-[10px] text-green-600 dark:text-green-500 mt-1 flex items-center gap-1">
                                        {paidChange.isPositive ? (
                                            <>
                                                <TrendingUp className="h-2.5 w-2.5" />
                                                +{paidChange.percent.toFixed(0)}% vs last month
                                            </>
                                        ) : paidChange.isNeutral ? (
                                            <>
                                                <Minus className="h-2.5 w-2.5" />
                                                No change
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="h-2.5 w-2.5" />
                                                -{paidChange.percent.toFixed(0)}% vs last month
                                            </>
                                        )}
                                    </p>
                                )}
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium mb-1">Unpaid</p>
                                <p className="text-lg font-bold text-yellow-900 dark:text-yellow-300">
                                    {formatCurrency(financialData.currentMonth.invoicesUnpaid)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Expenses
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">Approved</p>
                                <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                                    {formatCurrency(financialData.currentMonth.expensesApproved)}
                                </p>
                            </div>

                            <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium mb-1">Pending</p>
                                <p className="text-lg font-bold text-orange-900 dark:text-orange-300">
                                    {formatCurrency(financialData.currentMonth.expensesPending)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </WidgetContainer>
    )
}
