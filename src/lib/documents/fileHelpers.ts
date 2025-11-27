import { FileText, FileImage, FileSpreadsheet, File } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Get appropriate icon based on file content type
 */
export function getFileIcon(contentType: string): LucideIcon {
    if (contentType.startsWith('image/')) return FileImage
    if (contentType.includes('spreadsheet') || contentType.includes('excel')) return FileSpreadsheet
    if (contentType.includes('pdf') || contentType.includes('document')) return FileText
    return File
}

/**
 * Format bytes to human-readable file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    const parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
    const categoryMap: Record<string, string> = {
        all: 'All Categories',
        invoice: 'Invoices',
        receipt: 'Receipts',
        contract: 'Contracts',
        statement: 'Statements',
        tax: 'Tax Documents',
        other: 'Other',
    }
    return categoryMap[category] || category
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(contentType: string): boolean {
    const allowed = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    return allowed.some((type) => contentType.includes(type))
}
