import { formatDistanceToNow } from 'date-fns'

export interface DocumentDateCellProps {
  uploadedAt: string
}

export function DocumentDateCell({ uploadedAt }: DocumentDateCellProps) {
  return (
    <span className="text-sm text-gray-600 dark:text-gray-400">
      {formatDistanceToNow(new Date(uploadedAt), { addSuffix: true })}
    </span>
  )
}
