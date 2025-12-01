'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PortalLayoutSkeleton } from './layout/PortalLayoutSkeleton'

interface PortalAuthGuardProps {
    children: React.ReactNode
}

/**
 * PortalAuthGuard - Ensures user is authenticated before rendering portal content
 * Handles session loading state and redirects unauthenticated users
 */
export function PortalAuthGuard({ children }: PortalAuthGuardProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // While session is loading, show skeleton to avoid hydration mismatch
    if (!isClient || status === 'loading') {
        return <PortalLayoutSkeleton />
    }

    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
        router.push('/api/auth/signin?callbackUrl=/portal')
        return null
    }

    // If authenticated, render children
    if (status === 'authenticated' && session) {
        return <>{children}</>
    }

    // Fallback (should not reach here)
    return <PortalLayoutSkeleton />
}
