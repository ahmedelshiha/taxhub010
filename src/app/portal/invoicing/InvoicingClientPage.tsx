'use client'

import { useState } from 'react'
import { PageLayout } from '@/components/ui-oracle'
import { useInvoicing } from '@/hooks/useInvoicing'
import { filterInvoices } from '@/lib/invoicing'
import { InvoicingHeader } from '@/components/portal/invoicing/InvoicingHeader'
import { InvoicingKPIs } from '@/components/portal/invoicing/InvoicingKPIs'
import { InvoicingFilters } from '@/components/portal/invoicing/InvoicingFilters'
import { InvoicingTable } from '@/components/portal/invoicing/InvoicingTable'
import { CreateInvoiceModal } from '@/components/portal/invoicing/modals/CreateInvoiceModal'

export default function InvoicingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const { invoices, isLoading, error, createInvoice, isCreating, downloadInvoice, payInvoice } = useInvoicing()
  const filteredInvoices = filterInvoices(invoices, searchQuery, statusFilter)

  return (
    <PageLayout title="Invoicing" maxWidth="7xl">
      <div className="space-y-6">
        <InvoicingHeader onCreateClick={() => setCreateModalOpen(true)} />
        <InvoicingKPIs invoices={filteredInvoices} />
        <InvoicingFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
        />
        <InvoicingTable
          invoices={filteredInvoices}
          loading={isLoading}
          error={error as any}
          onDownload={downloadInvoice}
          onPay={payInvoice}
          onCreateClick={() => setCreateModalOpen(true)}
        />
        <CreateInvoiceModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={(data) => {
            createInvoice(data)
            setCreateModalOpen(false)
          }}
          isCreating={isCreating}
        />
      </div>
    </PageLayout>
  )
}
