/**
 * Notification Bell Component
 * Displays notification icon with badge count in portal header
 * Opens dropdown with recent notifications
 */

'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { NotificationWithRelations } from '@/types/notifications'

interface NotificationBellProps {
    onOpenCenter?: () => void
    className?: string
}

export default function NotificationBell({
    onOpenCenter,
    className,
}: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()

    // Fetch recent notifications (last 5 unread) using React Query
    const { data } = useQuery<{
        success: boolean
        data: NotificationWithRelations[]
        meta: {
            total: number
            unreadCount: number
            limit: number
            offset: number
            hasMore: boolean
        }
    }>({
        queryKey: ['/api/notifications', { unreadOnly: true, limit: 5 }],
        queryFn: async () => {
            const res = await fetch('/api/notifications?unreadOnly=true&limit=5')
            if (!res.ok) throw new Error('Failed to fetch notifications')
            return res.json()
        },
        staleTime: 30000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 60000, // Refetch every 60 seconds
    })

    const rawNotifications = data?.data
    const notifications = Array.isArray(rawNotifications) ? rawNotifications : []
    const unreadCount = data?.meta?.unreadCount || 0

    // Mark notification as read when clicked
    const handleNotificationClick = async (
        notificationId: string,
        link?: string
    ) => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationIds: [notificationId],
                    action: 'read',
                }),
            })

            // Invalidate and refetch notifications
            queryClient.invalidateQueries({
                queryKey: ['/api/notifications']
            })

            // Navigate to link if provided
            if (link) {
                window.location.href = link
            }

            setIsOpen(false)
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    // Get notification type color
    const getTypeColor = (type: string): string => {
        if (type.includes('error') || type.includes('reject'))
            return 'text-red-600 dark:text-red-400'
        if (type.includes('success') || type.includes('approv'))
            return 'text-green-600 dark:text-green-400'
        if (type.includes('warning') || type.includes('due'))
            return 'text-yellow-600 dark:text-yellow-400'
        return 'text-blue-600 dark:text-blue-400'
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('relative', className)}
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                            aria-label={`${unreadCount} unread notifications`}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {unreadCount} unread
                        </Badge>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No new notifications</p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    'flex-col items-start gap-1 cursor-pointer p-3',
                                    !notification.readAt && 'bg-blue-50 dark:bg-blue-950'
                                )}
                                onClick={() =>
                                    handleNotificationClick(notification.id, notification.link)
                                }
                            >
                                <div className="flex items-start justify-between w-full gap-2">
                                    <p className="text-sm font-medium line-clamp-2">
                                        {notification.title}
                                    </p>
                                    {!notification.readAt && (
                                        <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {notification.message}
                                </p>
                                <div className="flex items-center gap-2 w-full mt-1">
                                    <span className={cn('text-xs font-medium', getTypeColor(notification.type))}>
                                        {notification.type.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(notification.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        ))}

                        {data?.meta?.hasMore && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer"
                                    onClick={() => {
                                        setIsOpen(false)
                                        onOpenCenter?.()
                                    }}
                                >
                                    View all notifications
                                </DropdownMenuItem>
                            </>
                        )}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
