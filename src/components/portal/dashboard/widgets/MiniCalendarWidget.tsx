"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MiniCalendarWidget() {
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    // Fetch events for the current month to show indicators
    const start = startOfMonth(currentMonth).toISOString();
    const end = endOfMonth(currentMonth).toISOString();

    const { data } = useSWR(
        `/api/portal/calendar?start=${start}&end=${end}`,
        fetcher
    );

    const events = data?.data || [];

    // Function to check if a day has events
    const getDayModifiers = (day: Date) => {
        const hasEvent = events.some((event: any) =>
            isSameDay(new Date(event.start), day)
        );
        return hasEvent ? "has-event" : "";
    };

    const handleDateSelect = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate);
            // Navigate to main calendar focused on this date
            // Note: In a real app, we'd pass the date as a query param
            router.push("/portal/calendar");
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calendar</CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => router.push("/portal/calendar")}
                >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center pt-0">
                <div className="mini-calendar-wrapper">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        className="rounded-md border shadow-sm p-3 pointer-events-auto"
                        modifiers={{ hasEvent: (date) => getDayModifiers(date) === "has-event" }}
                        modifiersClassNames={{
                            hasEvent: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
