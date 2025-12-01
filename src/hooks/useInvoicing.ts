/**
 * useInvoicing Hook
 * React Query hook for invoice data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import type { Invoice } from '@/lib/invoicing'

interface InvoicesResponse {
  invoices: Invoice[]
  total: number
}

interface CreateInvoiceInput {
  description: string
  amount: number
  dueDate?: string
}

export function useInvoicing() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<InvoicesResponse>({
    queryKey: ['invoices'],
    queryFn: () => apiClient.get<InvoicesResponse>('/api/billing/invoices'),
    staleTime: 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateInvoiceInput) =>
      apiClient.post('/api/billing/invoices', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create invoice')
    },
  })

  const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/download`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Download started')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const payInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/pay`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Payment initiation failed')

      const data = await response.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.success('Payment processed successfully!')
        queryClient.invalidateQueries({ queryKey: ['invoices'] })
      }
    } catch (error) {
      toast.error('Failed to process payment')
    }
  }

  return {
    invoices: data?.invoices || [],
    total: data?.total || 0,
    isLoading,
    error,
    createInvoice: createMutation.mutate,
    isCreating: createMutation.isPending,
    downloadInvoice,
    payInvoice,
  }
}
