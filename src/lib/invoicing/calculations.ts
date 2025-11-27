export interface Invoice {
    id: string
    invoiceNumber: string
    date: string
    amount: number
    status: 'paid' | 'pending' | 'overdue' | 'draft'
    currency: string
    pdfUrl?: string
    description?: string
    dueDate?: string
}

export function calculateTotalAmount(invoices: Invoice[]): number {
    return invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
}

export function calculatePaidAmount(invoices: Invoice[]): number {
    return invoices.filter((invoice) => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0)
}

export function calculatePendingAmount(invoices: Invoice[]): number {
    return invoices.filter((invoice) => invoice.status === 'pending' || invoice.status === 'overdue')
        .reduce((sum, invoice) => sum + invoice.amount, 0)
}

export function countByStatus(invoices: Invoice[], status: string): number {
    if (status === 'pending_overdue') {
        return invoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue').length
    }
    return invoices.filter((inv) => inv.status === status).length
}
