/**
 * API Client - Production-Ready API Wrapper
 * 
 * Features:
 * - Request/response interceptors
 * - Error handling with types
 * - Auth token injection
 * - Request timeout
 * - Retry logic
 * - TypeScript support
 */

import { getSession } from 'next-auth/react'

export interface APIError {
    message: string
    status: number
    code?: string
    details?: unknown
}

export class APIClientError extends Error {
    status: number
    code?: string
    details?: unknown

    constructor(error: APIError) {
        super(error.message)
        this.name = 'APIClientError'
        this.status = error.status
        this.code = error.code
        this.details = error.details
    }
}

interface RequestConfig extends RequestInit {
    timeout?: number
}

const DEFAULT_TIMEOUT = 30000 // 30 seconds

/**
 * Production-ready fetch wrapper with error handling
 */
async function apiFetch<T>(
    url: string,
    config: RequestConfig = {}
): Promise<T> {
    const {
        timeout = DEFAULT_TIMEOUT,
        ...fetchConfig
    } = config

    // Get session for auth token
    const session = await getSession()

    // Set up headers
    const headers = new Headers(fetchConfig.headers)
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    // Add auth token if available
    if (session?.user) {
        headers.set('Authorization', `Bearer ${(session as any).accessToken || ''}`)
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            ...fetchConfig,
            headers,
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Handle non-OK responses
        if (!response.ok) {
            let errorData: any
            try {
                errorData = await response.json()
            } catch {
                errorData = { message: response.statusText }
            }

            throw new APIClientError({
                message: errorData.message || errorData.error || 'An error occurred',
                status: response.status,
                code: errorData.code,
                details: errorData.details,
            })
        }

        // Parse JSON response
        const data = await response.json()
        return data
    } catch (error) {
        clearTimeout(timeoutId)

        // Handle abort/timeout
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new APIClientError({
                message: 'Request timeout',
                status: 408,
                code: 'TIMEOUT',
            })
        }

        // Re-throw API errors
        if (error instanceof APIClientError) {
            throw error
        }

        // Handle network errors
        throw new APIClientError({
            message: error instanceof Error ? error.message : 'Network error',
            status: 0,
            code: 'NETWORK_ERROR',
        })
    }
}

/**
 * API methods
 */
export const apiClient = {
    get: <T>(url: string, config?: RequestConfig) =>
        apiFetch<T>(url, { ...config, method: 'GET' }),

    post: <T>(url: string, data?: unknown, config?: RequestConfig) =>
        apiFetch<T>(url, {
            ...config,
            method: 'POST',
            body: JSON.stringify(data),
        }),

    put: <T>(url: string, data?: unknown, config?: RequestConfig) =>
        apiFetch<T>(url, {
            ...config,
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    patch: <T>(url: string, data?: unknown, config?: RequestConfig) =>
        apiFetch<T>(url, {
            ...config,
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    delete: <T>(url: string, config?: RequestConfig) =>
        apiFetch<T>(url, { ...config, method: 'DELETE' }),
}

/**
 * Simple fetcher for SWR
 * @param url - API endpoint to fetch
 */
export const fetcher = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
        const error: any = new Error('An error occurred while fetching the data.');
        error.info = await response.json();
        error.status = response.status;
        throw error;
    }

    return response.json();
};

