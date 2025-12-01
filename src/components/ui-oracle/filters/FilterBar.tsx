/**
 * FilterBar - Oracle Fusion Style Filter Panel
 * 
 * Collapsible filter bar with:
 * - Active filter chips display
 * - Clear all functionality
 * - Expandable filter panel
 * - Filter count badge
 */

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterChip } from './FilterChip'
import { cn } from '@/lib/utils'

export interface Filter {
    id: string
    label: string
    value: string
    variant?: 'default' | 'primary' | 'secondary'
}

export interface FilterBarProps {
    /** Active filters */
    filters: Filter[]

    /** Callback when a filter is removed */
    onRemoveFilter: (filterId: string) => void

    /** Callback when all filters are cleared */
    onClearAll: () => void

    /** Filter panel content (form controls) */
    children?: React.ReactNode

    /** Whether filter panel is initially expanded */
    defaultExpanded?: boolean

    /** Additional CSS classes */
    className?: string
}

export function FilterBar({
    filters,
    onRemoveFilter,
    onClearAll,
    children,
    defaultExpanded = false,
    className,
}: FilterBarProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)
    const hasFilters = filters.length > 0

    return (
        <div className={cn('space-y-3', className)}>
            {/* Filter chips and controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Active filters */}
                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                    {hasFilters ? (
                        <>
                            {filters.map((filter) => (
                                <FilterChip
                                    key={filter.id}
                                    label={filter.label}
                                    value={filter.value}
                                    variant={filter.variant}
                                    onRemove={() => onRemoveFilter(filter.id)}
                                />
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearAll}
                                className="h-8 text-sm"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear all
                            </Button>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No filters applied
                        </p>
                    )}
                </div>

                {/* Expand/collapse button */}
                {children && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-shrink-0"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4 mr-2" />
                                Hide Filters
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                Show Filters
                                {hasFilters && (
                                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                                        {filters.length}
                                    </span>
                                )}
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Expandable filter panel */}
            {children && isExpanded && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    {children}
                </div>
            )}
        </div>
    )
}
