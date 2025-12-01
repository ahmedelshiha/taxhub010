/**
 * Notification Center Modal
 * Full-featured notification management modal
 * Supports filtering, pagination, mark all as read, and delete
 */

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Calendar,
    Clock,
    AlertCircle,
    Info,
    Mail,
    User,
    FileText,
} from 'lucide-react'
import useSWR from 'swr'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { NotificationWithRelations, NotificationType } from '@/types/notifications'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface NotificationCenterModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function NotificationCenterModal({
    open,
    onOpenChange,
}: NotificationCenterModalProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Build API URL based on active tab
    const apiUrl = `/api/notifications?limit=50&unreadOnly=${activeTab === 'unread'}`

    // Fetch notifications
    const { data, error, isLoading, mutate } = useSWR<{
        success: boolean
        data: NotificationWithRelations[]
        meta: {
            total: number
            unreadCount: number
            hasMore: boolean
        }
    }>(open ? apiUrl : null, fetcher)

    const notifications = data?.data || []
    const unreadCount = data?.meta?.unreadCount || 0

    // Reset selection when tab changes
    useEffect(() => {
        setSelectedIds(new Set())
    }, [activeTab])

    // Toggle notification selection
    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    // Mark selected as read
    const markSelectedAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationIds: Array.from(selectedIds),
                    action: 'read',
                }),
            })

            toast.success(`Marked ${selectedIds.size} notification(s) as read`)
            setSelectedIds(new Set())
            mutate()
        } catch (error) {
            toast.error('Failed to mark notifications as read')
        }
    }

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'read',
                }),
            })

            toast.success('All notifications marked as read')
            mutate()
        } catch (error) {
            toast.error('Failed to mark all as read')
        }
    }

    // Delete selected notifications
    const deleteSelected = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationIds: Array.from(selectedIds),
                    action: 'delete',
                }),
            })

            toast.success(`Deleted ${selectedIds.size} notification(s)`)
            setSelectedIds(new Set())
            mutate()
        } catch (error) {
            toast.error('Failed to delete notifications')
        }
    }

    // Get icon for notification type
    const getNotificationIcon = (type: NotificationType) => {
        const iconClass = 'h-5 w-5'

        if (type.includes('booking')) return <Calendar className={iconClass} />
        if (type.includes('task')) return <CheckCheck className={iconClass} />
        if (type.includes('document')) return <FileText className={iconClass} />
        if (type.includes('message') || type.includes('mention'))
            return <Mail className={iconClass} />
        if (type.includes('user')) return <User className={iconClass} />
        if (type.includes('approval')) return <Check className={iconClass} />

        return <Bell className={iconClass} />
    }

    // Get color for notification type
    const getTypeColor = (type: string): string => {
        if (type.includes('reject') || type.includes('cancel'))
            return 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200'
        if (type.includes('approv') || type.includes('confirm'))
            return 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200'
        if (type.includes('due') || type.includes('overdue'))
            return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200'
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
    }

    // Handle notification click
    const handleNotificationClick = async (notification: NotificationWithRelations) => {
        // Mark as read if not already
        if (!notification.readAt) {
            try {
                await fetch('/api/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        notificationIds: [notification.id],
                        action: 'read',
                    }),
                })
                mutate()
            } catch (error) {
                console.error('Failed to mark as read:', error)
            }
        }

        // Navigate to link if provided
        if (notification.link) {
            onOpenChange(false)
            window.location.href = notification.link
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">Notification Center</DialogTitle>
                        {unreadCount > 0 && (
                            <Badge variant="secondary">
                                {unreadCount} unread
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="px-6">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="unread">
                                Unread
                                {unreadCount > 0 && ` (${unreadCount})`}
                            </TabsTrigger>
                        </TabsList>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-4 mb-4">
                            {selectedIds.size > 0 ? (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={markSelectedAsRead}
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Mark {selectedIds.size} as read
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={deleteSelected}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete {selectedIds.size}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {unreadCount > 0 && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={markAllAsRead}
                                        >
                                            <CheckCheck className="h-4 w-4 mr-2" />
                                            Mark all as read
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>

                        <TabsContent value="all" className="mt-0 space-y-0">
                            <NotificationList
                                notifications={notifications}
                                isLoading={isLoading}
                                error={error}
                                selectedIds={selectedIds}
                                onToggleSelection={toggleSelection}
                                onNotificationClick={handleNotificationClick}
                                getNotificationIcon={getNotificationIcon}
                                getTypeColor={getTypeColor}
                            />
                        </TabsContent>

                        <TabsContent value="unread" className="mt-0 space-y-0">
                            <NotificationList
                                notifications={notifications}
                                isLoading={isLoading}
                                error={error}
                                selectedIds={selectedIds}
                                onToggleSelection={toggleSelection}
                                onNotificationClick={handleNotificationClick}
                                getNotificationIcon={getNotificationIcon}
                                getTypeColor={getTypeColor}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Notification List Component
interface NotificationListProps {
    notifications: NotificationWithRelations[]
    isLoading: boolean
    error: any
    selectedIds: Set<string>
    onToggleSelection: (id: string) => void
    onNotificationClick: (notification: NotificationWithRelations) => void
    getNotificationIcon: (type: NotificationType) => React.ReactNode
    getTypeColor: (type: string) => string
}

function NotificationList({
    notifications,
    isLoading,
    error,
    selectedIds,
    onToggleSelection,
    onNotificationClick,
    getNotificationIcon,
    getTypeColor,
}: NotificationListProps) {
    if (error) {
        return (
            <div className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Failed to load notifications
                </p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Skeleton className="h-5 w-5 rounded" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (notifications.length === 0) {
        return (
            <div className="py-12 text-center max-h-[400px] overflow-y-auto pb-6">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    No notifications to display
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pb-6">
            {notifications.map((notification) => {
                const isSelected = selectedIds.has(notification.id)
                const isUnread = !notification.readAt

                return (
                    <div
                        key={notification.id}
                        className={cn(
                            'flex items-start gap-3 p-3 border rounded-lg transition-colors',
                            isUnread && 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
                            isSelected && 'ring-2 ring-blue-500',
                            notification.link && 'cursor-pointer hover:shadow-md'
                        )}
                        onClick={(e) => {
                            // Don't trigger click if checkbox was clicked
                            if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
                                return
                            }
                            onNotificationClick(notification)
                        }}
                    >
                        {/* Selection checkbox */}
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelection(notification.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Icon */}
                        <div className={cn('p-2 rounded-lg flex-shrink-0', getTypeColor(notification.type))}>
                            {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-medium line-clamp-2">
                                    {notification.title}
                                </h4>
                                {isUnread && (
                                    <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                )}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {notification.message}
                            </p>

                            {notification.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">
                                    {notification.description}
                                </p>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                        addSuffix: true,
                                    })}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    {notification.type.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
