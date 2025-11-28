import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import PortalDashboardLayout from '@/components/portal/layout/PortalDashboardLayout'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Get session with timeout - errors logged but don't crash
    let session = null
    try {
        const sessionPromise = getServerSession(authOptions)
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 3000))
        session = await Promise.race([sessionPromise, timeoutPromise])

        if (session === null) {
            console.warn('[Portal] Session fetch timed out or failed, continuing with null session')
        }
    } catch (error) {
        console.error('[Portal] Session error:', error)
        // Continue with null session - client will redirect if needed
    }

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
}
