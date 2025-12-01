
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PortalProviders } from './PortalProviders'

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
        <PortalProviders session={session as any}>
            {children}
        </PortalProviders>
    )
}
