/**
 * useDocuments Hook
 * React Query hook for document data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import type { Document } from '@/lib/documents'

interface DocumentsResponse {
    success: boolean
    data: {
        documents: Document[]
        total: number
        limit: number
        offset: number
    }
}

interface UseDocumentsOptions {
    searchQuery?: string
    categoryFilter?: string
    entityId?: string
}

export function useDocuments(options: UseDocumentsOptions = {}) {
    const queryClient = useQueryClient()

    // Build query params
    const params = new URLSearchParams()
    if (options.entityId) params.append('entityId', options.entityId)
    if (options.searchQuery) params.append('search', options.searchQuery)
    if (options.categoryFilter && options.categoryFilter !== 'all') {
        params.append('category', options.categoryFilter)
    }

    const queryKey = ['documents', options]

    // Fetch documents
    const { data, isLoading, error } = useQuery<DocumentsResponse>({
        queryKey,
        queryFn: () => apiClient.get<DocumentsResponse>(`/api/documents?${params.toString()}`),
        staleTime: 60 * 1000,
    })

    // Upload document mutation
    const uploadMutation = useMutation({
        mutationFn: (formData: FormData) =>
            apiClient.post('/api/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] })
            toast.success('Document uploaded successfully!')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Upload failed')
        },
    })

    // Star/unstar document mutation
    const starMutation = useMutation({
        mutationFn: ({ id, starred }: { id: string; starred: boolean }) =>
            starred
                ? apiClient.delete(`/api/documents/${id}/star`)
                : apiClient.post(`/api/documents/${id}/star`),
        onSuccess: (_, { starred }) => {
            queryClient.invalidateQueries({ queryKey: ['documents'] })
            toast.success(starred ? 'Removed from favorites' : 'Added to favorites')
        },
        onError: () => {
            toast.error('Failed to update favorites')
        },
    })

    // Download document function
    const downloadDocument = async (id: string, filename: string) => {
        try {
            const response = await fetch(`/api/documents/${id}/download`)
            if (!response.ok) throw new Error('Download failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success('Download started')
        } catch (error) {
            toast.error('Download failed')
        }
    }

    return {
        documents: data?.data?.documents || [],
        total: data?.data?.total || 0,
        isLoading,
        error,
        uploadDocument: uploadMutation.mutate,
        isUploading: uploadMutation.isPending,
        starDocument: (id: string, starred: boolean) =>
            starMutation.mutate({ id, starred }),
        isStarring: starMutation.isPending,
        downloadDocument,
    }
}
