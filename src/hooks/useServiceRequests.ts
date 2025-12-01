/**
 * useServiceRequests Hook
 * Wrapper around useBookings hook for service requests
 * Uses the existing shared useBookings hook with portal scope
 */

import { useBookings } from '@/hooks/useBookings'

export interface UseServiceRequestsOptions {
  page?: number
  limit?: number
  q?: string
  status?: string
  bookingType?: string
  dateFrom?: string
  dateTo?: string
  type?: 'all' | 'requests' | 'appointments'
}

export function useServiceRequests(options: UseServiceRequestsOptions = {}) {
  const {
    page = 1,
    limit = 10,
    q = '',
    status = 'ALL',
    bookingType: bookingTypeInput = 'ALL',
    dateFrom,
    dateTo,
    type = 'all',
  } = options

  // Ensure bookingType is a valid type
  const bookingType = (bookingTypeInput as any) || 'ALL'

  // Use existing shared useBookings hook with portal scope
  const { items, pagination, isLoading, refresh } = useBookings({
    scope: 'portal',
    page,
    limit,
    q,
    status,
    bookingType,
    dateFrom,
    dateTo,
    type,
  })

  const totalPages = pagination?.totalPages || 1
  const total = pagination?.total || (Array.isArray(items) ? items.length : 0)

  return {
    serviceRequests: items || [],
    total,
    totalPages,
    isLoading,
    refresh,
  }
}
