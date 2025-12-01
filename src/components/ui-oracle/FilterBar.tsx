/**
 * FilterBar Component
 * Filter bar with chips
 */

import { FilterChip } from './FilterChip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Filter {
    id: string
    label: string
}

export interface FilterBarProps {
    filters: Filter[]
    onRemoveFilter: (id: string) => void
    onClearAll?: () => void
    className?: string
}

export function FilterBar({ filters, onRemoveFilter, onClearAll, className }: FilterBarProps) {
    if (filters.length === 0) return null

    return (
        <div className={cn('flex items-center gap-2 flex-wrap', className)}>
            <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
            {filters.map((filter) => (
                <FilterChip
                    key={filter.id}
                    label={filter.label}
                    onRemove={() => onRemoveFilter(filter.id)}
                />
            ))}
            {onClearAll && filters.length > 1 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-6 text-xs"
                >
                    Clear all
                </Button>
            )}
        </div>
    )
}
