"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { Loader2, Clock, Calendar as CalendarIcon, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

interface TimeSlot {
    start: string;
    end: string;
    available: boolean;
    reason?: string;
}

interface AvailabilityResponse {
    date: string;
    service: string;
    slots: TimeSlot[];
    timezone: string;
}

interface AvailabilityCheckerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSlotSelect?: (date: Date, time: string) => void;
    preselectedServiceId?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AvailabilityCheckerModal({
    open,
    onOpenChange,
    onSlotSelect,
    preselectedServiceId,
}: AvailabilityCheckerModalProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [serviceId, setServiceId] = useState<string>(preselectedServiceId || "consultation");
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Reset selection when modal opens/closes
    useEffect(() => {
        if (open) {
            setSelectedSlot(null);
            if (!date) setDate(new Date());
        }
    }, [open]);

    // Fetch availability when date or service changes
    const { data, error, isLoading } = useSWR(
        date && open
            ? `/api/bookings/availability?date=${format(date, "yyyy-MM-dd")}&serviceId=${serviceId}`
            : null,
        fetcher
    );

    const handleBook = () => {
        if (date && selectedSlot && onSlotSelect) {
            onSlotSelect(date, selectedSlot);
            onOpenChange(false);
            toast.success(`Selected ${format(date, "MMM d")} at ${selectedSlot}`);
        }
    };

    const slots = data?.data?.slots || [];
    const availableSlots = slots.filter((s: TimeSlot) => s.available);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Check Availability</DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Left Column: Controls */}
                    <div className="w-[300px] flex flex-col gap-6 border-r pr-6">
                        {/* Service Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Service
                            </label>
                            <Select value={serviceId} onValueChange={setServiceId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="consultation">Tax Consultation (60m)</SelectItem>
                                    <SelectItem value="audit">Audit Review (120m)</SelectItem>
                                    <SelectItem value="planning">Financial Planning (90m)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Picker */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date
                            </label>
                            <div className="border rounded-md p-2">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(date) => isBefore(date, startOfToday())}
                                    initialFocus
                                    className="rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Time Slots */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="mb-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-500" />
                                Available Times
                                {date && (
                                    <span className="text-gray-500 font-normal text-sm ml-2">
                                        for {format(date, "MMMM d, yyyy")}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                    <p>Checking availability...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-red-500">
                                    <AlertCircle className="h-8 w-8 mb-2" />
                                    <p>Failed to load availability</p>
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <CalendarIcon className="h-8 w-8 mb-2" />
                                    <p>No slots available for this date</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {slots.map((slot: TimeSlot, index: number) => (
                                        <Button
                                            key={`${slot.start}-${index}`}
                                            variant={selectedSlot === slot.start ? "default" : "outline"}
                                            className={`
                        h-auto py-3 flex flex-col gap-1
                        ${!slot.available ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900" : ""}
                        ${selectedSlot === slot.start ? "ring-2 ring-offset-2 ring-primary" : ""}
                      `}
                                            disabled={!slot.available}
                                            onClick={() => slot.available && setSelectedSlot(slot.start)}
                                        >
                                            <span className="font-semibold">{slot.start}</span>
                                            {slot.reason && (
                                                <span className="text-[10px] text-red-500 font-normal">
                                                    {slot.reason}
                                                </span>
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBook}
                                disabled={!selectedSlot || !date}
                                className="w-32"
                            >
                                Select Time
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
