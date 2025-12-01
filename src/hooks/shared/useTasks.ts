'use client'

import { useMemo } from 'react'
import { usePortalQuery } from '@/hooks/usePortalQuery'

export interface TaskFilters {
  status?: string
  assigneeId?: string
  priority?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
  search?: string
  assignedToMe?: boolean
}

export interface UseTasksResponse {
  data: any[]
  error?: any
  isLoading: boolean
  isValidating: boolean
  mutate: () => Promise<any>
  refresh: () => void
  hasMore: boolean
  total: number
}

/**
 * Fetch tasks with optional filters
 * For portal users with assignedToMe=true, returns only assigned tasks
 * For admin users, returns all tasks with optional filters
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useTasks({ assignedToMe: true, status: 'OPEN' })
 * ```
 */
export function useTasks(
  filters: TaskFilters = {},
  options?: any
): UseTasksResponse {
  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (filters.status) p.append('status', filters.status)
    if (filters.assigneeId) p.append('assigneeId', filters.assigneeId)
    if (filters.priority) p.append('priority', filters.priority)
    if (filters.dateFrom) p.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) p.append('dateTo', filters.dateTo)
    if (filters.limit) p.append('limit', String(filters.limit))
    if (filters.offset) p.append('offset', String(filters.offset))
    if (filters.search) p.append('search', filters.search)
    if (filters.assignedToMe !== undefined) p.append('assignedToMe', String(filters.assignedToMe))
    return p.toString()
  }, [filters])

  const endpoint = `/api/tasks${params ? `?${params}` : ''}`

  const { data: responseData, error, isFetching, refetch } = usePortalQuery<any>(
    endpoint,
    ['tasks', params],
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      ...options
    }
  )

  return {
    data: responseData?.data || [],
    error,
    isLoading: !responseData && !error,
    isValidating: isFetching,
    mutate: refetch,
    refresh: () => refetch(),
    hasMore: responseData?.meta?.hasMore || false,
    total: responseData?.meta?.total || 0,
  }
}

/**
 * Fetch all tasks for admin dashboard or portal user tasks
 * Uses sensible defaults for pagination and sorting
 */
export function useTasksData(filters: TaskFilters = {}) {
  return useTasks({ ...filters, assignedToMe: false, limit: filters.limit || 50 })
}

/**
 * Fetch a single task with full details including comments
 */
export function useTaskDetail(taskId: string) {
  const { data: responseData, error, isLoading, refetch } = usePortalQuery<any>(
    `/api/tasks/${taskId}`,
    ['tasks', taskId],
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  )

  return {
    task: responseData?.data || null,
    comments: responseData?.data?.comments || [],
    error,
    isLoading: !responseData && !error,
    mutate: refetch,
  }
}

export default useTasks
