'use client'

import { SearchBox } from '@/components/ui-oracle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter } from 'lucide-react'

export interface InvoicingFiltersProps {
    searchQuery: string
    statusFilter: string
    onSearchChange: (query: string) => void
    onStatusChange: (status: string) => void
}

export function InvoicingFilters({ searchQuery, statusFilter, onSearchChange, onStatusChange }: InvoicingFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                <SearchBox value={searchQuery} onSearch={onSearchChange} placeholder="Search invoices..." />
            </div>
            <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
