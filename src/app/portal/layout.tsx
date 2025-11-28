/**
 * Portal Layout
 * Applies PortalDashboardLayout with all required providers to /portal/* routes
 * 
 * Providers:
 * - SessionProvider: Authentication state
 * - ThemeProvider: Dark mode support
 * - QueryProvider: React Query data fetching
 */

import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PortalDashboardLayout from '@/components/portal/layout/PortalDashboardLayout'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Fallback component for when layout fails
function LayoutErrorFallback({ error }: { error?: string }) {
    return (
        <html lang="en">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
                                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Portal Temporarily Unavailable
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                We&apos;re experiencing technical difficulties. Please try again in a moment.
                            </p>
                            {error && (
                                <p className="text-xs text-gray-500 mt-4 font-mono">{error}</p>
                            )}
                        </div>
                        <a
                            href="/login"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Return to Login
                        </a>
                    </div>
                </div>
            </body>
        </html>
    )
}

export default async function PortalAppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Get session server-side for initial state with comprehensive error handling
    let session: Session | null = null
    let layoutError: string | null = null

    try {
        const sessionPromise = getServerSession(authOptions)
        const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 2000)
        )

        const result = await Promise.race([sessionPromise, timeoutPromise])
        session = result as Session | null

        // If we got a timeout, log it but continue
        if (result === null) {
            console.warn('[Portal Layout] Session fetch timed out after 2s, continuing with null session')
        }
    } catch (error) {
        console.error('[Portal Layout] Failed to get session:', error)
        layoutError = error instanceof Error ? error.message : 'Unknown error'
        session = null
    }

    // If we have a critical layout error, return fallback
    if (layoutError && layoutError.includes('ECONNREFUSED')) {
        return <LayoutErrorFallback error="Database connection failed" />
    }

    // Wrap providers with additional error boundary
    try {
        return (
            <SessionProvider session={session}>
                <ThemeProvider defaultTheme="light" enableSystem>
                    <QueryProvider>
                        <PortalDashboardLayout>
                            {children}
                        </PortalDashboardLayout>
                    </QueryProvider>
                </ThemeProvider>
            </SessionProvider>
        )
    } catch (error) {
        console.error('[Portal Layout] Provider initialization failed:', error)
        return <LayoutErrorFallback error="Failed to initialize portal" />
    }
}
