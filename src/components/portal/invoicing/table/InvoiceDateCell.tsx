import { formatInvoiceDate } from '@/lib/invoicing'

export interface InvoiceDateCellProps {
  date: string
}

export function InvoiceDateCell({ date }: InvoiceDateCellProps) {
  return (
    <span className="text-sm text-gray-600 dark:text-gray-400">
      {formatInvoiceDate(date)}
    </span>
  )
}
