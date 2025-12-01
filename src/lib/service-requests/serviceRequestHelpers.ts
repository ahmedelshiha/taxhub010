export interface ServiceSummary {
    id: string
    name: string
    slug: string
    category?: string | null
}

export interface ServiceRequest {
    id: string
    title: string
    status: string
    priority: string
    createdAt: string
    updatedAt: string
    service: ServiceSummary
}

export type ServiceRequestStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'IN_REVIEW'
    | 'APPROVED'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'

export type ServiceRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type BookingType = 'ALL' | 'STANDARD' | 'RECURRING' | 'EMERGENCY' | 'CONSULTATION'

/**
 * Get status badge color classes
 */
export function getStatusBadgeColor(status: string): string {
    const statusStyles: Record<string, string> = {
        DRAFT: 'bg-gray-100 text-gray-800',
        SUBMITTED: 'bg-blue-100 text-blue-800',
        IN_REVIEW: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-emerald-100 text-emerald-800',
        ASSIGNED: 'bg-indigo-100 text-indigo-800',
        IN_PROGRESS: 'bg-sky-100 text-sky-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    }
    return statusStyles[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get priority badge color classes
 */
export function getPriorityBadgeColor(priority: string): string {
    const priorityStyles: Record<string, string> = {
        LOW: 'bg-gray-100 text-gray-800',
        MEDIUM: 'bg-gray-100 text-gray-800',
        HIGH: 'bg-orange-100 text-orange-800',
        URGENT: 'bg-red-100 text-red-800',
    }
    return priorityStyles[priority] || 'bg-gray-100 text-gray-800'
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
    return status.replace('_', ' ')
}

/**
 * Export service requests to CSV
 */
export async function exportServiceRequestsCSV(
    items: ServiceRequest[],
    filters: { status?: string; bookingType?: string; dateFrom?: string; dateTo?: string; q?: string; type?: string }
): Promise<void> {
    if (!items.length) return

    const params = new URLSearchParams()
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status)
    if (filters.bookingType && filters.bookingType !== 'ALL') params.set('bookingType', filters.bookingType)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    if (filters.q) params.set('q', filters.q)
    if (filters.type && filters.type !== 'all') params.set('type', filters.type)

    try {
        const res = await fetch(
            `/api/portal/service-requests/export${params.toString() ? `?${params}` : ''}`,
            { cache: 'no-store' }
        )
        if (res.ok) {
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `service-requests-${new Date().toISOString().slice(0, 10)}.csv`
            a.click()
            URL.revokeObjectURL(url)
            return
        }
    } catch {
        // Fallback to client-side CSV generation
    }

    // Client-side CSV generation
    const rows = items.map((r) => ({
        id: r.id,
        title: r.title,
        service: r.service?.name,
        priority: r.priority,
        status: r.status,
        createdAt: new Date(r.createdAt).toISOString(),
    }))

    const header = Object.keys(rows[0]).join(',')
    const csv = [
        header,
        ...rows.map((row) =>
            Object.values(row)
                .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
                .join(',')
        ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `service-requests-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}
