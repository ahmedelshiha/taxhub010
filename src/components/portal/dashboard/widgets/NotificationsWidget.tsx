import React from 'react'
import { WidgetContainer } from '../WidgetContainer'
import { Bell, ArrowRight, CheckCircle2, AlertCircle, Info, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Notification {
    id: string
    type: 'info' | 'warning' | 'success' | 'error'
    title: string
    message: string
    createdAt: string
    read: boolean
}

interface NotificationsWidgetProps {
    className?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const notificationIcons = {
    info: { icon: Info, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    success: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    error: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
}

export function NotificationsWidget({ className }: NotificationsWidgetProps) {
    const { data, error, isLoading, mutate } = useSWR<{
        success: boolean
        data: Notification[]
    }>(
        '/api/notifications?unreadOnly=true&limit=5',
        fetcher,
        {
            refreshInterval: 60000, // Auto-refresh every 60 seconds
            revalidateOnFocus: true,
        }
    )

    const notifications = data?.data || []
    const hasError = error || (data && !data.success)

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
            })

            if (!response.ok) {
                throw new Error('Failed to mark as read')
            }

            // Optimistically update the UI
            mutate()
            toast.success('Notification marked as read')
        } catch (err) {
            console.error('Error marking notification as read:', err)
            toast.error('Failed to mark notification as read')
        }
    }

    return (
        <WidgetContainer
            title="Notifications"
            icon={<Bell className="h-5 w-5" />}
            loading={isLoading}
            error={hasError ? 'Failed to load notifications' : undefined}
            action={
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                    <Link href="/portal/notifications">
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            }
            className={className}
        >
            {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-full mb-3">
                        <Bell className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">All caught up!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No unread notifications.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => {
                        const iconConfig = notificationIcons[notification.type]
                        const Icon = iconConfig.icon

                        return (
                            <div
                                key={notification.id}
                                className="group relative flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all cursor-pointer"
                            >
                                {/* Icon */}
                                <div className={cn(
                                    "flex-shrink-0 p-2 rounded-lg",
                                    iconConfig.bg
                                )}>
                                    <Icon className={cn("h-4 w-4", iconConfig.color)} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                            {notification.title}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleMarkAsRead(notification.id)
                                            }}
                                            title="Mark as read"
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1.5">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>

                                {/* Unread indicator */}
                                {!notification.read && (
                                    <div className="absolute top-2 right-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </WidgetContainer>
    )
}
