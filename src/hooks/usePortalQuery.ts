/**
 * Portal Query Hooks - Custom React Query Hooks
 * 
 * Production-ready hooks for portal data fetching with:
 * - Type safety
 * - Error handling
 * - Loading states
 * - Cache management
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, APIClientError } from '@/lib/api-client'
import { toast } from 'sonner'

/**
 * Hook for fetching portal overview data
 */
export function usePortalOverview() {
  return useQuery({
    queryKey: ['portal', 'overview'],
    queryFn: () => apiClient.get('/api/portal/overview'),
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook for fetching portal tasks
 */
export function usePortalTasks() {
  return useQuery({
    queryKey: ['portal', 'tasks'],
    queryFn: () => apiClient.get('/api/portal/tasks'),
  })
}

/**
 * Hook for fetching compliance data
 */
export function usePortalCompliance() {
  return useQuery({
    queryKey: ['portal', 'compliance'],
    queryFn: () => apiClient.get('/api/portal/compliance'),
  })
}

/**
 * Hook for fetching financial data
 */
export function usePortalFinancial() {
  return useQuery({
    queryKey: ['portal', 'financial'],
    queryFn: () => apiClient.get('/api/portal/financial'),
  })
}

/**
 * Hook for fetching activity data
 */
export function usePortalActivity() {
  return useQuery({
    queryKey: ['portal', 'activity'],
    queryFn: () => apiClient.get('/api/portal/activity'),
  })
}

/**
 * Generic portal query hook
 */
export function usePortalQuery<T>(
  endpoint: string,
  key: string[],
  options?: Omit<UseQueryOptions<T, APIClientError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, APIClientError>({
    queryKey: ['portal', ...key],
    queryFn: () => apiClient.get<T>(endpoint),
    ...options,
  })
}

/**
 * Generic portal mutation hook with toast notifications
 */
export function usePortalMutation<TData, TVariables>(
  endpoint: string,
  options?: {
    onSuccess?: (data: TData) => void
    onError?: (error: APIClientError) => void
    invalidateKeys?: string[][]
    successMessage?: string
    errorMessage?: string
  }
) {
  const queryClient = useQueryClient()

  return useMutation<TData, APIClientError, TVariables>({
    mutationFn: (variables) => apiClient.post<TData>(endpoint, variables),
    onSuccess: (data) => {
      // Invalidate queries to refetch data
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }

      // Show success toast
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }

      // Call custom success callback
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      // Show error toast
      if (options?.errorMessage) {
        toast.error(options.errorMessage)
      } else {
        toast.error(error.message || 'An error occurred')
      }

      // Call custom error callback
      options?.onError?.(error)
    },
  })
}
