/**
 * SearchBox Component
 * Search input with icon
 */
/**
 * SearchBox Component
 * Search input with icon
 */

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface SearchBoxProps {
    value?: string
    onChange?: (value: string) => void
    onSearch?: (value: string) => void
    placeholder?: string
    className?: string
}

export function SearchBox({ value, onChange, onSearch, placeholder = 'Search...', className }: SearchBoxProps) {
    return (
        <div className={cn('relative', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                value={value}
                onChange={(e) => {
                    onChange?.(e.target.value)
                    onSearch?.(e.target.value)
                }}
                placeholder={placeholder}
                className="pl-10"
            />
        </div>
    )
}
