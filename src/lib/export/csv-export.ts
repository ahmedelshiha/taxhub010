/**
 * CSV Export Utility
 * Helper functions for exporting data to CSV format
 */

export interface CSVColumn {
    key: string
    label: string
    format?: (value: any) => string
}

export function generateCSV(data: any[], columns: CSVColumn[]): string {
    // Create header row
    const headers = columns.map(col => `"${col.label}"`).join(',')

    // Create data rows
    const rows = data.map(row => {
        return columns.map(col => {
            let value = row[col.key]

            // Apply formatting if provided
            if (col.format) {
                value = col.format(value)
            }

            // Handle null/undefined
            if (value === null || value === undefined) {
                value = ''
            }

            // Escape quotes and wrap in quotes
            value = String(value).replace(/"/g, '""')
            return `"${value}"`
        }).join(',')
    })

    return [headers, ...rows].join('\n')
}

export function downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// Preset column configurations for common data types
export const csvPresets = {
    tasks: [
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Priority' },
        { key: 'assignee', label: 'Assignee', format: (v: any) => v?.name || '' },
        { key: 'dueAt', label: 'Due Date', format: (v: any) => v ? new Date(v).toLocaleDateString() : '' },
    ],
    compliance: [
        { key: 'title', label: 'Obligation' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'dueDate', label: 'Due Date', format: (v: any) => new Date(v).toLocaleDateString() },
        { key: 'entity', label: 'Entity', format: (v: any) => v?.name || '' },
    ],
    financial: [
        { key: 'number', label: 'Invoice #' },
        { key: 'client', label: 'Client', format: (v: any) => v?.name || '' },
        { key: 'totalCents', label: 'Amount', format: (v: number) => `$${(v / 100).toFixed(2)}` },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Date', format: (v: any) => new Date(v).toLocaleDateString() },
    ],
} as const
