import { StatusBadge } from '@/components/ui-oracle'
import { getAVStatusVariant, getAVStatusText } from '@/lib/documents'

export interface DocumentStatusCellProps {
    avStatus: string
}

export function DocumentStatusCell({ avStatus }: DocumentStatusCellProps) {
    return (
        <StatusBadge variant={getAVStatusVariant(avStatus)} showDot>
            {getAVStatusText(avStatus)}
        </StatusBadge>
    )
}
