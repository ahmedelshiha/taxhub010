/**
 * Portal Dashboard Layout
 * Main layout wrapper for portal pages with sidebar navigation
 * Adapts AdminDashboardLayout pattern for client portal
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import PortalSidebar from './PortalSidebar'
import PortalHeader from './PortalHeader'
import PortalFooter from './PortalFooter'
import { Breadcrumbs } from '../Breadcrumbs'
import { useResponsive } from '@/hooks/admin/useResponsive'
import {
    usePortalSidebarCollapsed,
    usePortalLayoutActions
} from '@/stores/portal/layout.store'
import { cn } from '@/lib/utils'
import { PortalLayoutSkeleton } from './PortalLayoutSkeleton'
import { OfflineIndicator } from '../OfflineIndicator'

interface PortalDashboardLayoutProps {
    children: React.ReactNode
    className?: string
}

export default function PortalDashboardLayout({
    children,
    className
}: PortalDashboardLayoutProps) {
    const pathname = usePathname()
    const responsive = useResponsive()

    // State from Zustand store
    const collapsed = usePortalSidebarCollapsed()
    const { setSidebarCollapsed } = usePortalLayoutActions()

    // Mobile menu state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Client-side hydration flag
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Auto-collapse sidebar on mobile/tablet with guard to avoid infinite loops
    const prevResponsiveRef = useRef({ isMobile: responsive.isMobile, isTablet: responsive.isTablet })
    useEffect(() => {
        const prev = prevResponsiveRef.current
        const shouldCollapse = (responsive.isMobile || responsive.isTablet) && !prev.isMobile && !prev.isTablet
        if (shouldCollapse && !collapsed) {
            setSidebarCollapsed(true)
        }
        // Update ref for next render
        prevResponsiveRef.current = { isMobile: responsive.isMobile, isTablet: responsive.isTablet }
    }, [responsive.isMobile, responsive.isTablet, setSidebarCollapsed, collapsed])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    const handleMenuToggle = useCallback(() => {
        if (responsive.isMobile) {
            setMobileMenuOpen(!mobileMenuOpen)
        } else {
            setSidebarCollapsed(!collapsed)
        }
    }, [responsive.isMobile, mobileMenuOpen, collapsed, setSidebarCollapsed])

    const handleMobileMenuClose = useCallback(() => {
        setMobileMenuOpen(false)
    }, [])

    // Calculate content margin based on sidebar state
    const contentMargin = responsive.isMobile
        ? 'ml-0'
        : collapsed
            ? 'ml-16'
            : 'ml-64'

    // Loading skeleton during SSR
    if (!isClient) {
        return <PortalLayoutSkeleton />
    }

    return (
        <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
            {/* Skip to main content link for accessibility */}
            <a
                href="#portal-main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-white focus:text-blue-600 focus:ring-2 focus:ring-blue-600 focus:px-3 focus:py-2 focus:z-[60] rounded"
                onClick={(e) => {
                    e.preventDefault()
                    document.getElementById('portal-main-content')?.focus()
                }}
            >
                Skip to main content
            </a>

            {/* Sidebar */}
            <PortalSidebar
                isMobile={responsive.isMobile}
                isOpen={mobileMenuOpen}
                onClose={handleMobileMenuClose}
            />

            {/* Main content area */}
            <div
                className={cn(
                    'min-h-screen flex flex-col transition-all duration-300',
                    contentMargin
                )}
            >
                {/* Header */}
                <PortalHeader
                    onMenuToggle={handleMenuToggle}
                    isMobile={responsive.isMobile}
                />

                {/* Breadcrumbs */}
                <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <Breadcrumbs />
                    </div>
                </div>

                {/* Scrollable content */}
                <main
                    id="portal-main-content"
                    tabIndex={-1}
                    className="flex-1 focus:outline-none"
                    role="main"
                    aria-label="Portal content"
                >
                    {children}
                </main>

                {/* Footer */}
                <PortalFooter />
            </div>

            <OfflineIndicator />
        </div>
    )
}
