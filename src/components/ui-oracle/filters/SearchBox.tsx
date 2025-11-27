/**
 * SearchBox - Oracle Fusion Style Search Input
 * 
 * Search input with:
 * - Debounced search
 * - Clear button
 * - Loading indicator
 * - Keyboard shortcuts (Cmd+K/Ctrl+K support)
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SearchBoxProps {
    /** Search query value */
    value?: string

    /** Callback when search value changes (debounced) */
    onSearch: (query: string) => void

    /** Placeholder text */
    placeholder?: string

    /** Debounce delay in ms */
    debounceMs?: number

    /** Loading state */
    loading?: boolean

    /** Disabled state */
    disabled?: boolean

    /** Additional CSS classes */
    className?: string
}

export function SearchBox({
    value = '',
    onSearch,
    placeholder = 'Search...',
    debounceMs = 300,
    loading = false,
    disabled = false,
    className,
}: SearchBoxProps) {
    const [localValue, setLocalValue] = useState(value)

    // Sync with external value changes
    useEffect(() => {
        setLocalValue(value)
    }, [value])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onSearch(localValue)
            }
        }, debounceMs)

        return () => clearTimeout(timer)
    }, [localValue, value, debounceMs, onSearch])

    const handleClear = useCallback(() => {
        setLocalValue('')
        onSearch('')
    }, [onSearch])

    return (
        <div className={cn('relative', className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pl-9 pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {loading && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                    {localValue && !loading && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Clear search</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
