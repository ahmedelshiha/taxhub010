'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ContentSection, EmptyState, LoadingSkeleton, StatusMessage } from '@/components/ui-oracle'
import { FileText } from 'lucide-react'
import { InvoiceNumberCell } from './table/InvoiceNumberCell'
import { InvoiceDateCell } from './table/InvoiceDateCell'
import { InvoiceAmountCell } from './table/InvoiceAmountCell'
import { InvoiceStatusCell } from './table/InvoiceStatusCell'
import { InvoiceActionsCell } from './table/InvoiceActionsCell'
import type { Invoice } from '@/lib/invoicing'
import type { APIClientError } from '@/lib/api-client'

export interface InvoicingTableProps {
  invoices: Invoice[]
  loading: boolean
  error: APIClientError | null
  onDownload: (id: string, number: string) => void
  onPay: (id: string) => void
  onCreateClick: () => void
}

export function InvoicingTable({ invoices, loading, error, onDownload, onPay, onCreateClick }: InvoicingTableProps) {
  if (error) {
    return (
      <StatusMessage variant="error" title="Failed to load invoices">
        {error.message}
      </StatusMessage>
    )
  }

  if (loading) {
    return <LoadingSkeleton variant="table" count={5} />
  }

  if (invoices.length === 0) {
    return (
      <ContentSection>
        <EmptyState
          icon={FileText}
          title="No invoices found"
          description="Create your first invoice to get started"
          action={{ label: 'Create Invoice', onClick: onCreateClick }}
        />
      </ContentSection>
    )
  }

  return (
    <ContentSection title={`Invoices (${invoices.length})`}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <InvoiceNumberCell invoiceNumber={invoice.invoiceNumber} description={invoice.description} />
                </TableCell>
                <TableCell><InvoiceDateCell date={invoice.date} /></TableCell>
                <TableCell><InvoiceAmountCell amount={invoice.amount} currency={invoice.currency} /></TableCell>
                <TableCell><InvoiceStatusCell status={invoice.status} /></TableCell>
                <TableCell className="text-right">
                  <InvoiceActionsCell invoice={invoice} onDownload={onDownload} onPay={onPay} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ContentSection>
  )
}
