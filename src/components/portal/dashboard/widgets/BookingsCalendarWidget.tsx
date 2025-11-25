import React from 'react'
import { WidgetContainer } from '../WidgetContainer'
import { Calendar, ArrowRight, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Booking {
    id: string
    serviceName: string
    date: string
    time: string
    status: string
    location?: string
}

interface BookingsCalendarWidgetProps {
    bookings: Booking[]
    loading?: boolean
    error?: string
    onReschedule?: (booking: Booking) => void
    onCancel?: (booking: Booking) => void
}

export function BookingsCalendarWidget({
    bookings,
    loading,
    error,
    onReschedule,
    onCancel
}: BookingsCalendarWidgetProps) {
    return (
        <WidgetContainer
            title="Upcoming Bookings"
            icon={<Calendar className="h-5 w-5" />}
            loading={loading}
            error={error}
            action={
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                    <Link href="/portal/bookings">
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            }
        >
            {bookings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full mb-3">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No upcoming bookings</p>
                    <Button variant="link" className="text-blue-600 dark:text-blue-400 h-auto p-0 mt-1" asChild>
                        <Link href="/portal/bookings">Schedule a consultation</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                        <div
                            key={booking.id}
                            className="flex flex-col gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{booking.serviceName}</p>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(booking.date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {booking.time}
                                        </span>
                                    </div>
                                </div>
                                <Badge variant="outline" className={cn(
                                    "text-[10px] uppercase tracking-wide",
                                    booking.status === 'confirmed' ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"
                                )}>
                                    {booking.status}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs flex-1"
                                    onClick={() => onReschedule?.(booking)}
                                >
                                    Reschedule
                                </Button>
                                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => onCancel?.(booking)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </WidgetContainer>
    )
}
