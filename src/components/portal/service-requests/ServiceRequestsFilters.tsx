'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from '@/lib/i18n'

export interface ServiceRequestsFiltersProps {
    q: string
    status: string
    bookingType: string
    typeTab: 'all' | 'requests' | 'appointments'
    dateFrom: string
    dateTo: string
    limit: number
    onSearchChange: (value: string) => void
    onStatusChange: (value: string) => void
    onBookingTypeChange: (value: string) => void
    onTypeTabChange: (value: 'all' | 'requests' | 'appointments') => void
    onDateFromChange: (value: string) => void
    onDateToChange: (value: string) => void
    onLimitChange: (value: number) => void
    onClearFilters: () => void
}

export function ServiceRequestsFilters({
    q,
    status,
    bookingType,
    typeTab,
    dateFrom,
    dateTo,
    limit,
    onSearchChange,
    onStatusChange,
    onBookingTypeChange,
    onTypeTabChange,
    onDateFromChange,
    onDateToChange,
    onLimitChange,
    onClearFilters,
}: ServiceRequestsFiltersProps) {
    const { t } = useTranslations()

    const hasActiveFilters =
        q ||
        (status && status !== 'ALL') ||
        (bookingType && bookingType !== 'ALL') ||
        dateFrom ||
        dateTo

    return (
        <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <Tabs value={typeTab} onValueChange={(v) => onTypeTabChange(v as any)}>
                    <TabsList>
                        <TabsTrigger value="all">{t('portal.serviceRequests.tabs.all')}</TabsTrigger>
                        <TabsTrigger value="requests">{t('portal.serviceRequests.tabs.requests')}</TabsTrigger>
                        <TabsTrigger value="appointments">{t('portal.serviceRequests.tabs.appointments')}</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Input
                    value={q}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t('portal.serviceRequests.searchPlaceholder')}
                    className="w-64"
                    aria-label={t('portal.serviceRequests.searchAria')}
                />

                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger aria-label={t('portal.serviceRequests.selectAllStatus')}>
                        <SelectValue placeholder={t('portal.serviceRequests.selectAllStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t('portal.serviceRequests.status.All')}</SelectItem>
                        <SelectItem value="SUBMITTED">{t('portal.serviceRequests.status.Submitted')}</SelectItem>
                        <SelectItem value="IN_REVIEW">{t('portal.serviceRequests.status.InReview')}</SelectItem>
                        <SelectItem value="APPROVED">{t('portal.serviceRequests.status.Approved')}</SelectItem>
                        <SelectItem value="ASSIGNED">{t('portal.serviceRequests.status.Assigned')}</SelectItem>
                        <SelectItem value="IN_PROGRESS">{t('portal.serviceRequests.status.InProgress')}</SelectItem>
                        <SelectItem value="COMPLETED">{t('portal.serviceRequests.status.Completed')}</SelectItem>
                        <SelectItem value="CANCELLED">{t('portal.serviceRequests.status.Cancelled')}</SelectItem>
                        <SelectItem value="DRAFT">{t('portal.serviceRequests.status.Draft')}</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={bookingType} onValueChange={onBookingTypeChange}>
                    <SelectTrigger className="w-[200px]" aria-label={t('portal.serviceRequests.selectBookingType')}>
                        <SelectValue placeholder={t('portal.serviceRequests.selectBookingType')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t('portal.serviceRequests.bookingType.All')}</SelectItem>
                        <SelectItem value="STANDARD">{t('portal.serviceRequests.bookingType.STANDARD')}</SelectItem>
                        <SelectItem value="RECURRING">{t('portal.serviceRequests.bookingType.RECURRING')}</SelectItem>
                        <SelectItem value="EMERGENCY">{t('portal.serviceRequests.bookingType.EMERGENCY')}</SelectItem>
                        <SelectItem value="CONSULTATION">{t('portal.serviceRequests.bookingType.CONSULTATION')}</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600" htmlFor="from">
                        {t('portal.serviceRequests.from')}
                    </label>
                    <Input
                        id="from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => onDateFromChange(e.target.value)}
                        className="w-[160px]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600" htmlFor="to">
                        {t('portal.serviceRequests.to')}
                    </label>
                    <Input
                        id="to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => onDateToChange(e.target.value)}
                        className="w-[160px]"
                    />
                </div>

                <Select value={String(limit)} onValueChange={(v) => onLimitChange(parseInt(v, 10) || 10)}>
                    <SelectTrigger className="w-28" aria-label={t('portal.serviceRequests.perPage')}>
                        <SelectValue placeholder={t('portal.serviceRequests.perPage')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">{t('pagination.perPageOption', { count: 10 })}</SelectItem>
                        <SelectItem value="20">{t('pagination.perPageOption', { count: 20 })}</SelectItem>
                        <SelectItem value="50">{t('pagination.perPageOption', { count: 50 })}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={onClearFilters}
                    className="text-sm text-gray-600 hover:underline self-start"
                    aria-label={t('portal.serviceRequests.clearFiltersAria')}
                >
                    {t('dashboard.clear')}
                </button>
            )}
        </div>
    )
}
