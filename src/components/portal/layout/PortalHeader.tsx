/**
 * Portal Header Component
 * Top navigation bar with search, notifications, and quick actions
 * Inspired by Oracle Fusion shell bar
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Bell, Menu, Plus, Calendar, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import NotificationBell from '@/components/portal/layout/NotificationBell'
import EntitySwitcher from '@/components/portal/layout/EntitySwitcher'
import { useModal } from '@/components/providers/ModalProvider'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'

interface PortalHeaderProps {
  onMenuToggle?: () => void
  isMobile?: boolean
}

export default function PortalHeader({ onMenuToggle, isMobile = false }: PortalHeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { openModal } = useModal()
  const [searchQuery, setSearchQuery] = useState('')

  const userName = session?.user?.name?.split(' ')[0] || 'User'

  // Cmd+K / Ctrl+K shortcut for global search
  useKeyboardShortcut({
    id: 'global-search-open',
    combo: 'Meta+k',
    description: 'Open global search',
    action: () => openModal('global-search')
  })

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile menu + Search */}
          <div className="flex items-center gap-3 flex-1">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuToggle}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <div className="relative hidden md:block flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search entities, filings, documents..."
                className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => openModal('global-search')}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>


          {/* Right: Entity Switcher + Actions + Notifications */}
          <div className="flex items-center gap-2">
            {/* Entity Switcher */}
            <EntitySwitcher />

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block" />

            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/portal/documents')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/portal/bookings')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block" />

            {/* Notifications */}
            <NotificationBell onOpenCenter={() => openModal('notification-center')} />

            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => openModal('global-search')}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}
