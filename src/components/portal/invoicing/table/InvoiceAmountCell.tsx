import { formatCurrency } from '@/lib/invoicing'

export interface InvoiceAmountCellProps {
    amount: number
    currency: string
}

export function InvoiceAmountCell({ amount, currency }: InvoiceAmountCellProps) {
    return (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(amount, currency)}
        </span>
    )
}
