import { Button } from '@/components/ui/button'
import { Download, CreditCard } from 'lucide-react'
import { hasPDF, isPayable, type Invoice } from '@/lib/invoicing'

export interface InvoiceActionsCellProps {
    invoice: Invoice
    onDownload: (id: string, number: string) => void
    onPay: (id: string) => void
}

export function InvoiceActionsCell({ invoice, onDownload, onPay }: InvoiceActionsCellProps) {
    return (
        <div className="flex items-center justify-end gap-2">
            {hasPDF(invoice) && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload(invoice.id, invoice.invoiceNumber)}
                    title="Download PDF"
                >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                </Button>
            )}
            {isPayable(invoice) && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPay(invoice.id)}
                >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay
                </Button>
            )}
        </div>
    )
}
