import { formatFileSize } from '@/lib/documents'

export interface DocumentSizeCellProps {
    size: number
}

export function DocumentSizeCell({ size }: DocumentSizeCellProps) {
    return <span className="text-sm text-gray-600 dark:text-gray-400">{formatFileSize(size)}</span>
}
