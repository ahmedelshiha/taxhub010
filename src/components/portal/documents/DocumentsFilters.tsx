'use client'

import { SearchBox } from '@/components/ui-oracle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter } from 'lucide-react'

export interface DocumentsFiltersProps {
    searchQuery: string
    categoryFilter: string
    onSearchChange: (query: string) => void
    onCategoryChange: (category: string) => void
}

export function DocumentsFilters({
    searchQuery,
    categoryFilter,
    onSearchChange,
    onCategoryChange,
}: DocumentsFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                <SearchBox value={searchQuery} onSearch={onSearchChange} placeholder="Search documents..." />
            </div>
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="receipt">Receipts</SelectItem>
                    <SelectItem value="contract">Contracts</SelectItem>
                    <SelectItem value="statement">Statements</SelectItem>
                    <SelectItem value="tax">Tax Documents</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
