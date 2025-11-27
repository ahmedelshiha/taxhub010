"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useServiceRequests } from '@/hooks/useServiceRequests'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, List, CalendarDays, BarChart3, Download } from 'lucide-react'
import { usePermissions } from '@/lib/use-permissions'
import { PERMISSIONS } from '@/lib/permissions'
import { apiFetch } from '@/lib/api'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ServiceRequestsOverview from '@/components/admin/service-requests/overview'
import ServiceRequestFilters, { type RequestFilters } from '@/components/admin/service-requests/filters'
import ServiceRequestsTable from '@/components/admin/service-requests/table'
import ServiceRequestsBulkActions from '@/components/admin/service-requests/bulk-actions'
import ServiceRequestsCalendarView from '@/components/admin/service-requests/calendar-view'
import { useRealtime } from '@/hooks/useRealtime'

export default function AdminServiceRequestsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const perms = usePermissions()
  const rt = useRealtime(['service-request-updated', 'team-assignment', 'availability-updated'])

  const [filters, setFilters] = useState<RequestFilters>({
    status: 'ALL',
    priority: 'ALL',
    bookingType: 'ALL',
    paymentStatus: 'ALL',
    q: '',
  })
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)
  const [typeTab, setTypeTab] = useState<'ALL' | 'REQUESTS' | 'APPOINTMENTS'>('ALL')
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR' | 'ANALYTICS'>('LIST')

  // Initialize filters/type/view from URL for deep linking
  useEffect(() => {
    if (!searchParams) return
    const get = (k: string) => searchParams.get(k) || ''
    const nextFilters = {
      status: (get('status') as any) || 'ALL',
      priority: (get('priority') as any) || 'ALL',
      bookingType: (get('bookingType') as any) || 'ALL',
      paymentStatus: (get('paymentStatus') as any) || 'ALL',
      q: get('q') || '',
      dateFrom: get('dateFrom') || undefined,
      dateTo: get('dateTo') || undefined,
    } as RequestFilters
    setFilters(nextFilters)
    const t = get('type')
    if (t === 'appointments') setTypeTab('APPOINTMENTS')
    else if (t === 'requests') setTypeTab('REQUESTS')
    const v = get('view')
    if (v === 'calendar') setViewMode('CALENDAR')
    else if (v === 'analytics') setViewMode('ANALYTICS')
    const p = parseInt(get('page') || '1', 10)
    if (!Number.isNaN(p) && p > 0) setPage(p)

  }, [])

  // Build URL query string (optional, useful for deep linking)
  const buildQuery = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))
    if (filters.q) params.set('q', filters.q)
    if (filters.status !== 'ALL') params.set('status', filters.status)
    if (filters.priority !== 'ALL') params.set('priority', filters.priority)
    if (filters.paymentStatus && filters.paymentStatus !== 'ALL') params.set('paymentStatus', filters.paymentStatus)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)

    const toggle = (id: string) => {
      setSelected(prev => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    }

    const exportCsv = async () => {
      const res = await apiFetch(`/api/admin/service-requests/export?${buildQuery}`)
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `service-requests-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }

    // Keep URL in sync for deep-linking
    useEffect(() => {
      const qs = buildQuery
      const href = `/admin/service-requests?${qs}`
      router.replace(href)
    }, [buildQuery, router])

    return (
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> New Request
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <Tabs value={typeTab} onValueChange={(v) => { setTypeTab(v as any); setPage(1) }}>
                    <TabsList>
                      <TabsTrigger value="ALL">All</TabsTrigger>
                      <TabsTrigger value="REQUESTS">Requests</TabsTrigger>
                      <TabsTrigger value="APPOINTMENTS">Appointments</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                    <TabsList>
                      <TabsTrigger value="LIST" className="flex items-center gap-2">
                        <List className="h-4 w-4" /> List
                      </TabsTrigger>
                      <TabsTrigger value="CALENDAR" className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" /> Calendar
                      </TabsTrigger>
                      <TabsTrigger value="ANALYTICS" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Analytics
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {isLoading ? (
                  <div className="text-center text-gray-400 py-12">Loading…</div>
                ) : viewMode === 'LIST' ? (
                  <ServiceRequestsTable
                    items={items}
                    selectedIds={selected}
                    onToggle={toggle}
                    onToggleAll={toggleAll}
                    onOpen={(id) => router.push(`/admin/service-requests/${id}`)}
                  />
                ) : viewMode === 'CALENDAR' ? (
                  <ServiceRequestsCalendarView
                    items={items}
                    onOpen={(id) => router.push(`/admin/service-requests/${id}`)}
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ServiceRequestsOverview />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <ServiceRequestsBulkActions selectedIds={[...selected]} onDone={reload} />
                <div className="text-sm text-gray-500">
                  Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1} • Total{' '}
                  {pagination?.total ?? items.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
