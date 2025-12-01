/**
 * FilterChip Component
 * Removable filter chip
 */

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface FilterChipProps {
    label: string
    onRemove?: () => void
    className?: string
}

export function FilterChip({ label, onRemove, className }: FilterChipProps) {
    return (
        <Badge
            variant="secondary"
            className={cn('gap-1 pr-1', className)}
        >
            <span>{label}</span>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </Badge>
    )
}
