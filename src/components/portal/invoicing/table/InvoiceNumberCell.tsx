import { FileText } from 'lucide-react'

export interface InvoiceNumberCellProps {
    invoiceNumber: string
    description?: string
}

export function InvoiceNumberCell({ invoiceNumber, description }: InvoiceNumberCellProps) {
    return (
        <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div>
                <p className="font-medium text-gray-900 dark:text-white">
                    {invoiceNumber}
                </p>
                {description && (
                    <p className="text-xs text-gray-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}
