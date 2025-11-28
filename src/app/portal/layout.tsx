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
import { authOptions } from '@/lib/auth'
import PortalDashboardLayout from '@/components/portal/layout/PortalDashboardLayout'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'

export const dynamic = 'force-dynamic'

export default async function PortalAppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Get session server-side for initial state with error handling and timeout
    let session = null
    try {
        session = await Promise.race([
            getServerSession(authOptions),
            new Promise((resolve) => setTimeout(() => resolve(null), 1000)),
        ])
    } catch (error) {
        console.error('Failed to get session in portal layout:', error)
        session = null
    }

    return (
        <SessionProvider session={session}>
            <ThemeProvider defaultTheme="light">
                <QueryProvider>
                    <PortalDashboardLayout>
                        {children}
                    </PortalDashboardLayout>
                </QueryProvider>
            </ThemeProvider>
        </SessionProvider>
    )
}
