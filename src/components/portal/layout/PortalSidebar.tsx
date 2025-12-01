/**
 * Portal Sidebar Component
 * Navigation sidebar adapted from AdminSidebar pattern
 * Features: collapsible, responsive, grouped sections, badge notifications
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
    Home,
    BarChart3,
    Users,
    FileText,
    DollarSign,
    Receipt,
    CreditCard,
    CheckSquare,
    Calendar,
    MessageCircle,
    Mail,
    HelpCircle,
    Settings,
    ChevronDown,
    ChevronRight,
    Building2,
    ClipboardList,
    Target,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    usePortalSidebarCollapsed,
    usePortalExpandedGroups,
    usePortalLayoutActions
} from '@/stores/portal/layout.store'
import { useQuery } from '@tanstack/react-query'

interface NavigationItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string | number
    children?: NavigationItem[]
}

interface NavigationSection {
    section: string
    items: NavigationItem[]
}

interface PortalSidebarProps {
    isMobile?: boolean
    isOpen?: boolean
    onClose?: () => void
}

export default function PortalSidebar({
    isMobile = false,
    isOpen = false,
    onClose
}: PortalSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = useSession()

    // State from Zustand store
    const collapsed = usePortalSidebarCollapsed()
    const expandedGroups = usePortalExpandedGroups()
    const { toggleGroup } = usePortalLayoutActions()

    // Fetch notification counts for badges using React Query
    const { data: countsResponse } = useQuery({
        queryKey: ['/api/portal/counts'],
        queryFn: async () => {
            const res = await fetch('/api/portal/counts')
            if (!res.ok) throw new Error('Failed to fetch counts')
            return res.json()
        },
        staleTime: 30000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 60000, // Refetch every 60 seconds (background)
    })
    const counts = countsResponse?.data || countsResponse

    // Navigation structure
    const navigation: NavigationSection[] = useMemo(() => [
        {
            section: 'Overview',
            items: [
                { name: 'Dashboard', href: '/portal', icon: Home },
                { name: 'Analytics', href: '/portal/analytics', icon: BarChart3 },
            ]
        },
        {
            section: 'Compliance',
            items: [
                {
                    name: 'KYC Center',
                    href: '/portal/kyc',
                    icon: Users,
                    badge: counts?.data?.kycPending || counts?.kycPending
                },
                {
                    name: 'Documents',
                    href: '/portal/documents',
                    icon: FileText,
                    badge: counts?.data?.documentsPending || counts?.documentsPending
                },
                {
                    name: 'Compliance',
                    href: '/portal/compliance',
                    icon: CheckSquare,
                    badge: counts?.data?.compliancePending || counts?.compliancePending
                },
            ]
        },
        {
            section: 'Financials',
            items: [
                {
                    name: 'Invoicing',
                    href: '/portal/invoicing',
                    icon: DollarSign,
                    badge: counts?.data?.invoicesPending || counts?.invoicesPending
                },
                {
                    name: 'Bills',
                    href: '/portal/bills',
                    icon: Receipt,
                    badge: counts?.data?.billsPending || counts?.billsPending
                },
                { name: 'Expenses', href: '/portal/expenses', icon: CreditCard },
            ]
        },
        {
            section: 'Operations',
            items: [
                {
                    name: 'Tasks',
                    href: '/portal/tasks',
                    icon: CheckSquare,
                    badge: counts?.data?.tasksPending || counts?.tasksPending
                },
                {
                    name: 'Bookings',
                    href: '/portal/bookings',
                    icon: Calendar,
                    badge: counts?.data?.upcomingBookings || counts?.upcomingBookings
                },
                {
                    name: 'Service Requests',
                    href: '/portal/service-requests',
                    icon: ClipboardList
                },
            ]
        },
        {
            section: 'Support',
            items: [
                { name: 'Messages', href: '/portal/messages', icon: Mail },
                { name: 'Help Center', href: '/portal/help', icon: HelpCircle },
                { name: 'Settings', href: '/portal/settings', icon: Settings },
            ]
        },
    ], [counts])

    const isActiveRoute = useCallback((href: string) => {
        if (href === '/portal') return pathname === '/portal'
        return pathname.startsWith(href)
    }, [pathname])

    const renderNavigationItem = (item: NavigationItem, depth = 0) => {
        const isActive = isActiveRoute(item.href)
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedGroups.includes(item.href)

        const baseClasses = cn(
            'transition-all duration-200 flex items-center rounded-lg font-medium',
            'group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
        )

        const expandedClasses = cn(
            'w-full px-3 py-2 text-sm',
            isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-2 border-blue-600'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        )

        const collapsedClasses = cn(
            'w-12 h-12 flex items-center justify-center',
            isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        )

        return (
            <li key={item.href}>
                {hasChildren ? (
                    <button
                        onClick={() => toggleGroup(item.href)}
                        aria-expanded={isExpanded}
                        className={cn(baseClasses, collapsed ? collapsedClasses : expandedClasses)}
                        title={collapsed ? item.name : undefined}
                    >
                        <item.icon className={cn('flex-shrink-0 h-5 w-5', !collapsed && 'mr-3')} />
                        {!collapsed && (
                            <>
                                <span className="flex-1 text-left">{item.name}</span>
                                {item.badge && (
                                    <Badge variant="secondary" className="ml-2">{item.badge}</Badge>
                                )}
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                )}
                            </>
                        )}
                    </button>
                ) : (
                    <Link
                        href={item.href}
                        onClick={isMobile ? onClose : undefined}
                        className={cn(baseClasses, collapsed ? collapsedClasses : expandedClasses)}
                        title={collapsed ? item.name : undefined}
                    >
                        <item.icon className={cn('flex-shrink-0 h-5 w-5', !collapsed && 'mr-3')} />
                        {!collapsed && (
                            <>
                                <span className="flex-1">{item.name}</span>
                                {item.badge && (
                                    <Badge variant="secondary" className="ml-2">{item.badge}</Badge>
                                )}
                            </>
                        )}
                    </Link>
                )}

                {hasChildren && isExpanded && !collapsed && (
                    <ul className="mt-1 ml-4 space-y-1">
                        {item.children!.map(child => renderNavigationItem(child, depth + 1))}
                    </ul>
                )}
            </li>
        )
    }

    const effectiveWidth = collapsed ? 64 : 256

    return (
        <>
            {/* Mobile overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
                    'flex flex-col transition-all duration-300',
                    isMobile && !isOpen && '-translate-x-full'
                )}
                style={{ width: `${effectiveWidth}px` }}
                role="navigation"
                aria-label="Portal sidebar"
            >
                {/* Logo/Header */}
                <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4">
                    {collapsed ? (
                        <Building2 className="h-8 w-8 text-blue-600" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-8 w-8 text-blue-600" />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                TaxHub
                            </span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
                    {navigation.map(section => (
                        <div key={section.section}>
                            {!collapsed && (
                                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    {section.section}
                                </h3>
                            )}
                            <ul className="space-y-1">
                                {section.items.map(item => renderNavigationItem(item))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer - User info */}
                {!collapsed && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                                    {session?.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {session?.user?.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {session?.user?.email || 'user@example.com'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    )
}
