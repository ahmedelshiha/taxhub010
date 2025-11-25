"use client"

import { useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    createdAt: string
    readAt: string | null
    link?: string | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const notificationTypeConfig = {
    booking: { color: 'bg-green-500', label: 'Booking' },
    task: { color: 'bg-blue-500', label: 'Task' },
    document: { color: 'bg-purple-500', label: 'Document' },
    invoice: { color: 'bg-orange-500', label: 'Invoice' },
    approval: { color: 'bg-red-500', label: 'Approval' },
    message: { color: 'bg-gray-500', label: 'Message' },
    default: { color: 'bg-gray-400', label: 'Notification' },
}

export function NotificationBell() {
    const [open, setOpen] = useState(false)

    // Fetch unread notifications
    const { data, error, isLoading, mutate } = useSWR<{
        success: boolean
        data: Notification[]
        meta: { unreadCount: number }
    }>(
        '/api/notifications?unreadOnly=true&limit=5',
        fetcher,
        {
            refreshInterval: 60000, // Auto-refresh every 60 seconds
            revalidateOnFocus: true,
        }
    )

    const notifications = data?.data || []
    const unreadCount = data?.meta?.unreadCount || 0
    const hasError = error || (data && !data.success)

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
            })

            if (!response.ok) {
                throw new Error('Failed to mark as read')
            }

            mutate()
            toast.success('Marked as read')
        } catch (err) {
            console.error('Error marking notification as read:', err)
            toast.error('Failed to mark as read')
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'read' }),
            })

            if (!response.ok) {
                throw new Error('Failed to mark all as read')
            }

            mutate()
            toast.success('All notifications marked as read')
        } catch (err) {
            console.error('Error marking all as read:', err)
            toast.error('Failed to mark all as read')
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        Notifications
                    </h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="h-7 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Loading notifications...
                        </div>
                    ) : hasError ? (
                        <div className="p-8 text-center text-sm text-red-600 dark:text-red-400">
                            Failed to load notifications
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                All caught up!
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                No new notifications
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {notifications.map((notification) => {
                                const typeConfig =
                                    notificationTypeConfig[notification.type as keyof typeof notificationTypeConfig] ||
                                    notificationTypeConfig.default

                                const content = (
                                    <div
                                        className={cn(
                                            'relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group',
                                            !notification.readAt && 'bg-blue-50/50 dark:bg-blue-900/10'
                                        )}
                                    >
                                        {!notification.readAt && (
                                            <div className="absolute top-4 left-2 h-2 w-2 rounded-full bg-blue-500" />
                                        )}

                                        <div className="pl-3">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium text-white',
                                                        typeConfig.color
                                                    )}
                                                >
                                                    {typeConfig.label}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        handleMarkAsRead(notification.id)
                                                    }}
                                                    title="Mark as read"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                                                {notification.title}
                                            </p>

                                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                                {notification.message}
                                            </p>

                                            <p className="text-[10px] text-gray-500 dark:text-gray-500">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )

                                if (notification.link) {
                                    return (
                                        <Link key={notification.id} href={notification.link} onClick={() => setOpen(false)}>
                                            {content}
                                        </Link>
                                    )
                                }

                                return <div key={notification.id}>{content}</div>
                            })}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href="/portal/notifications"
                        onClick={() => setOpen(false)}
                        className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                        View all notifications
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    )
}
