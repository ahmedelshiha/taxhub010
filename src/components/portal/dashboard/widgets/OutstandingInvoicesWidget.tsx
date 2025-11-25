import React from 'react'
import { WidgetContainer } from '../WidgetContainer'
import { DollarSign, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Invoice {
    id: string
    number: string
    amount: number
    dueDate: string
    status: string
}

interface OutstandingInvoicesWidgetProps {
    invoices: Invoice[]
    totalOutstanding: number
    loading?: boolean
    error?: string
}

export function OutstandingInvoicesWidget({
    invoices,
    totalOutstanding,
    loading,
    error
}: OutstandingInvoicesWidgetProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    return (
        <WidgetContainer
            title="Outstanding Invoices"
            icon={<DollarSign className="h-5 w-5" />}
            loading={loading}
            error={error}
            action={
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                    <Link href="/portal/billing">
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            }
        >
            <div className="flex flex-col h-full gap-4">
                {/* Total Summary */}
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Outstanding</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                        {formatCurrency(totalOutstanding)}
                    </p>
                </div>

                {/* Recent Invoices List */}
                <div className="flex-1 space-y-3">
                    {invoices.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-sm text-gray-500">
                            No unpaid invoices
                        </div>
                    ) : (
                        invoices.slice(0, 3).map((invoice) => (
                            <div
                                key={invoice.id}
                                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{invoice.number}</p>
                                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center mt-0.5">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(invoice.amount)}
                                    </p>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600">
                                        Pay Now
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </WidgetContainer>
    )
}
