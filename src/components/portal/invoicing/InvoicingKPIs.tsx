'use client'

import { KPICard, KPIGrid } from '@/components/ui-oracle'
import { DollarSign, CheckCircle, Clock } from 'lucide-react'
import {
    calculateTotalAmount,
    calculatePaidAmount,
    calculatePendingAmount,
    countByStatus,
    formatCurrency,
    type Invoice,
} from '@/lib/invoicing'

export interface InvoicingKPIsProps {
    invoices: Invoice[]
}

export function InvoicingKPIs({ invoices }: InvoicingKPIsProps) {
    const totalAmount = calculateTotalAmount(invoices)
    const paidAmount = calculatePaidAmount(invoices)
    const pendingAmount = calculatePendingAmount(invoices)
    const totalCount = invoices.length
    const paidCount = countByStatus(invoices, 'paid')
    const pendingCount = countByStatus(invoices, 'pending_overdue')

    return (
        <KPIGrid columns={3}>
            <KPICard
                label="Total Amount"
                value={formatCurrency(totalAmount)}
                comparisonText={`${totalCount} invoices`}
                icon={DollarSign}
                variant="info"
            />
            <KPICard
                label="Paid"
                value={formatCurrency(paidAmount)}
                comparisonText={`${paidCount} invoices`}
                icon={CheckCircle}
                variant="success"
            />
            <KPICard
                label="Pending"
                value={formatCurrency(pendingAmount)}
                comparisonText={`${pendingCount} invoices`}
                icon={Clock}
                variant="warning"
            />
        </KPIGrid>
    )
}
