import type { Invoice } from './calculations'

export function isPayable(invoice: Invoice): boolean {
    return invoice.status === 'pending' || invoice.status === 'overdue'
}

export function hasPDF(invoice: Invoice): boolean {
    return Boolean(invoice.pdfUrl)
}

export function matchesSearch(invoice: Invoice, query: string): boolean {
    if (!query) return true
    const lowerQuery = query.toLowerCase()
    return (
        invoice.invoiceNumber.toLowerCase().includes(lowerQuery) ||
        (invoice.description?.toLowerCase().includes(lowerQuery) ?? false)
    )
}

export function matchesStatus(invoice: Invoice, statusFilter: string): boolean {
    if (statusFilter === 'all') return true
    return invoice.status === statusFilter
}

export function filterInvoices(invoices: Invoice[], searchQuery: string, statusFilter: string): Invoice[] {
    return invoices.filter(
        (invoice) => matchesSearch(invoice, searchQuery) && matchesStatus(invoice, statusFilter)
    )
}
