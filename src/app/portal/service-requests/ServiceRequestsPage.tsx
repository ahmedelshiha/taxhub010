'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/ui-oracle'
import { useServiceRequests } from '@/hooks/useServiceRequests'
import { exportServiceRequestsCSV, type ServiceRequest } from '@/lib/service-requests'
import { ServiceRequestsHeader } from '@/components/portal/service-requests/ServiceRequestsHeader'
import { ServiceRequestsFilters } from '@/components/portal/service-requests/ServiceRequestsFilters'
import { ServiceRequestsList } from '@/components/portal/service-requests/ServiceRequestsList'
import { useTranslations } from '@/lib/i18n'

export default function ServiceRequestsPage() {
    const { t } = useTranslations()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [status, setStatus] = useState<string>(searchParams.get('status') || 'ALL')
    const [bookingType, setBookingType] = useState<string>(searchParams.get('bookingType') || 'ALL')
    const [typeTab, setTypeTab] = useState<'all' | 'requests' | 'appointments'>(
        (searchParams.get('type') as any) || 'all'
    )
    const [dateFrom, setDateFrom] = useState<string>(searchParams.get('dateFrom') || '')
    const [dateTo, setDateTo] = useState<string>(searchParams.get('dateTo') || '')
    const [q, setQ] = useState<string>(searchParams.get('q') || '')
    const [debouncedQ, setDebouncedQ] = useState<string>(q)
    const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10) || 1)
    const [limit, setLimit] = useState<number>(parseInt(searchParams.get('limit') || '10', 10) || 10)

    // Debounce search input
    useEffect(() => {
        const tmo = setTimeout(() => setDebouncedQ(q), 300)
        return () => clearTimeout(tmo)
    }, [q])

    // Keep URL in sync
    useEffect(() => {
        const params = new URLSearchParams()
        if (status && status !== 'ALL') params.set('status', status)
        if (bookingType && bookingType !== 'ALL') params.set('bookingType', bookingType)
        if (typeTab && typeTab !== 'all') params.set('type', typeTab)
        if (dateFrom) params.set('dateFrom', dateFrom)
        if (dateTo) params.set('dateTo', dateTo)
        if (debouncedQ) params.set('q', debouncedQ)
        params.set('page', String(page))
        params.set('limit', String(limit))
        const qs = params.toString()
        router.replace(qs ? `?${qs}` : '?', { scroll: false })
    }, [status, bookingType, typeTab, dateFrom, dateTo, debouncedQ, page, limit, router])

    // Reset page on filter changes
    useEffect(() => {
        setPage(1)
    }, [status, bookingType, typeTab, dateFrom, dateTo, debouncedQ, limit])

    const { serviceRequests, total, totalPages, isLoading } = useServiceRequests({
        page,
        limit,
        q: debouncedQ,
        status,
        bookingType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        type: typeTab,
    })

    const handleExport = () => {
        exportServiceRequestsCSV(serviceRequests as ServiceRequest[], {
            status,
            bookingType,
            dateFrom,
            dateTo,
            q: debouncedQ,
            type: typeTab,
        })
    }

    const handleClearFilters = () => {
        setQ('')
        setStatus('ALL')
        setBookingType('ALL')
        setDateFrom('')
        setDateTo('')
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <ServiceRequestsHeader onExport={handleExport} />

                <ServiceRequestsFilters
                    q={q}
                    status={status}
                    bookingType={bookingType}
                    typeTab={typeTab}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    limit={limit}
                    onSearchChange={setQ}
                    onStatusChange={setStatus}
                    onBookingTypeChange={setBookingType}
                    onTypeTabChange={setTypeTab}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                    onLimitChange={setLimit}
                    onClearFilters={handleClearFilters}
                />

                <ServiceRequestsList serviceRequests={serviceRequests as ServiceRequest[]} isLoading={isLoading} />

                {Array.isArray(serviceRequests) && serviceRequests.length > 0 && (
                    <div
                        className="flex items-center justify-between mt-4"
                        role="navigation"
                        aria-label={t('pagination.aria')}
                    >
                        <div className="text-sm text-gray-600">
                            {t('pagination.pageOf', { page, totalPages })}
                            {total ? ` • ${t('pagination.total', { total })}` : ''}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                aria-label={t('common.previous')}
                            >
                                {t('common.previous')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                aria-label={t('common.next')}
                            >
                                {t('common.next')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
