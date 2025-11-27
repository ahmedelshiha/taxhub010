import type { StatusVariant } from '@/components/ui-oracle'

export interface Document {
    id: string
    name: string
    size: number
    contentType: string
    key: string
    url: string | null
    uploadedAt: string
    avStatus: string
    starred?: boolean
    category?: string
}

/**
 * Get status badge variant based on AV scan status
 */
export function getAVStatusVariant(status: string): StatusVariant {
    switch (status) {
        case 'clean':
            return 'success'
        case 'infected':
            return 'danger'
        case 'scanning':
            return 'warning'
        default:
            return 'neutral'
    }
}

/**
 * Get display text for AV status
 */
export function getAVStatusText(status: string): string {
    switch (status) {
        case 'clean':
            return '✓ Clean'
        case 'infected':
            return '⚠ Infected'
        case 'scanning':
            return '⏳ Scanning'
        default:
            return 'Unknown'
    }
}

/**
 * Check if document is downloadable (only if clean)
 */
export function isDownloadable(doc: Document): boolean {
    return doc.avStatus === 'clean'
}

/**
 * Check if document is starred
 */
export function isStarred(doc: Document): boolean {
    return doc.starred === true
}
