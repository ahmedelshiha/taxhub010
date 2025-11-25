"use client";

import { useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { enUS } from "date-fns/locale";
import useSWR from "swr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import CalendarEventModal from "@/components/portal/modals/CalendarEventModal";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup localizer for React Big Calendar
const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: "booking" | "task" | "compliance";
    resource: any; // Original data for modal
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<View>("month");
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [eventModalOpen, setEventModalOpen] = useState(false);

    // Calculate date range for API
    const dateRange = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return {
            start: start.toISOString(),
            end: end.toISOString(),
        };
    }, [currentDate]);

    // Fetch calendar events
    const { data, error, isLoading } = useSWR(
        `/api/portal/calendar?start=${dateRange.start}&end=${dateRange.end}`,
        fetcher
    );

    const events: CalendarEvent[] = useMemo(() => {
        if (!data?.success || !data?.data) return [];

        return data.data.map((event: any) => ({
            id: event.id,
            title: event.title,
            start: new Date(event.start),
            end: new Date(event.end),
            type: event.type,
            resource: event.resource,
        }));
    }, [data]);

    // Event style by type
    const eventStyleGetter = useCallback((event: CalendarEvent) => {
        const colors = {
            booking: { backgroundColor: "#10b981", borderColor: "#059669" },
            task: { backgroundColor: "#3b82f6", borderColor: "#2563eb" },
            compliance: { backgroundColor: "#f59e0b", borderColor: "#d97706" },
        };

        const style = colors[event.type] || { backgroundColor: "#6b7280", borderColor: "#4b5563" };

        return {
            style: {
                ...style,
                borderRadius: "4px",
                opacity: 0.9,
                color: "white",
                border: `1px solid ${style.borderColor}`,
                fontSize: "0.875rem",
            },
        };
    }, []);

    // Event selection - opens modal
    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        setSelectedEvent(event);
        setEventModalOpen(true);
    }, []);

    // Navigate to today
    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Navigate months
    const handlePrevMonth = () => {
        setCurrentDate((prev) => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate((prev) => addMonths(prev, 1));
    };

    // View change
    const handleViewChange = (newView: View) => {
        setView(newView);
    };

    // Navigate
    const handleNavigate = (newDate: Date) => {
        setCurrentDate(newDate);
    };

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-red-600">Error loading calendar: {error.message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                        View and manage your bookings, tasks, and deadlines
                    </p>
                </div>
            </div>

            {/* Calendar */}
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Navigation */}
                        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-8" onClick={handleToday}>
                                    <CalendarIcon className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Today</span>
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                {format(currentDate, "MMMM yyyy")}
                            </span>
                        </div>

                        {/* View Selector */}
                        <div className="flex w-full sm:w-auto bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <Button
                                variant={view === "month" ? "secondary" : "ghost"}
                                size="sm"
                                className="flex-1 sm:flex-none h-7 text-xs sm:text-sm"
                                onClick={() => handleViewChange("month")}
                            >
                                Month
                            </Button>
                            <Button
                                variant={view === "week" ? "secondary" : "ghost"}
                                size="sm"
                                className="flex-1 sm:flex-none h-7 text-xs sm:text-sm"
                                onClick={() => handleViewChange("week")}
                            >
                                Week
                            </Button>
                            <Button
                                variant={view === "day" ? "secondary" : "ghost"}
                                size="sm"
                                className="flex-1 sm:flex-none h-7 text-xs sm:text-sm"
                                onClick={() => handleViewChange("day")}
                            >
                                Day
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    {isLoading ? (
                        // Loading skeleton
                        <div className="space-y-4 p-4">
                            <Skeleton className="h-[400px] sm:h-[600px] w-full" />
                        </div>
                    ) : events.length === 0 ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <CalendarIcon className="h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No events this month
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your calendar is clear. Book a service or create a task to get started.
                            </p>
                        </div>
                    ) : (
                        // Calendar
                        <div className="h-[500px] sm:h-[600px] p-2 sm:p-0">
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: "100%" }}
                                view={view}
                                onView={handleViewChange}
                                date={currentDate}
                                onNavigate={handleNavigate}
                                onSelectEvent={handleSelectEvent}
                                eventPropGetter={eventStyleGetter}
                                popup
                                showMultiDayTimes
                                className="text-xs sm:text-sm"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full sm:w-auto">Legend:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500"></div>
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Bookings</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-blue-500"></div>
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tasks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-orange-500"></div>
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Compliance</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Event Modal */}
            <CalendarEventModal
                event={selectedEvent}
                open={eventModalOpen}
                onOpenChange={setEventModalOpen}
                onEdit={(event) => {
                    console.log("Edit event:", event);
                    // TODO: Open appropriate edit modal (BookingCreateModal, TaskEditModal, etc.)
                }}
                onDelete={(event) => {
                    console.log("Delete event:", event);
                    // TODO: Implement delete logic
                }}
            />
        </div>
    );
}
