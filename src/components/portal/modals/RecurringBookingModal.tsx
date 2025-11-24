"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, addWeeks, addMonths, isBefore, startOfToday, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Repeat, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface RecurringBookingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialDate?: Date;
    initialTime?: string;
    serviceName?: string;
    onSubmit?: (dates: Date[]) => void;
}

type RecurrenceFrequency = "daily" | "weekly" | "monthly";
type EndCondition = "count" | "date";

export default function RecurringBookingModal({
    open,
    onOpenChange,
    initialDate = new Date(),
    initialTime = "09:00",
    serviceName = "Tax Consultation",
    onSubmit,
}: RecurringBookingModalProps) {
    // State
    const [frequency, setFrequency] = useState<RecurrenceFrequency>("weekly");
    const [interval, setInterval] = useState(1);
    const [selectedDays, setSelectedDays] = useState<number[]>([initialDate.getDay()]);
    const [endCondition, setEndCondition] = useState<EndCondition>("count");
    const [occurrences, setOccurrences] = useState(5);
    const [endDate, setEndDate] = useState<Date | undefined>(addMonths(initialDate, 1));
    const [generatedDates, setGeneratedDates] = useState<Date[]>([]);

    // Generate dates whenever settings change
    useEffect(() => {
        if (!open) return;
        generateDates();
    }, [frequency, interval, selectedDays, endCondition, occurrences, endDate, initialDate, open]);

    const generateDates = () => {
        const dates: Date[] = [];
        let currentDate = new Date(initialDate);
        let count = 0;
        const maxCount = endCondition === "count" ? occurrences : 100; // Safety limit
        const cutoffDate = endCondition === "date" && endDate ? endDate : addMonths(initialDate, 12);

        // Always include the start date if it matches criteria
        // For simplicity in this MVP, we start generating FROM the initial date

        while (count < maxCount) {
            // Check if current date is valid for the pattern
            let isValid = false;

            if (frequency === "daily") {
                isValid = true;
            } else if (frequency === "weekly") {
                if (selectedDays.includes(currentDate.getDay())) {
                    isValid = true;
                }
            } else if (frequency === "monthly") {
                if (currentDate.getDate() === initialDate.getDate()) {
                    isValid = true;
                }
            }

            if (isValid) {
                dates.push(new Date(currentDate));
                count++;
            }

            // Advance date
            if (frequency === "daily") {
                currentDate = addDays(currentDate, interval);
            } else if (frequency === "weekly") {
                // If we're in weekly mode but checking daily to find matching days
                // This logic is simplified; a robust implementation would jump weeks
                currentDate = addDays(currentDate, 1);
            } else if (frequency === "monthly") {
                currentDate = addMonths(currentDate, interval);
            }

            // Stop if we pass the end date
            if (endCondition === "date" && isBefore(cutoffDate, currentDate)) {
                break;
            }

            // Safety break
            if (count >= 100) break;
        }

        setGeneratedDates(dates);
    };

    const toggleDay = (dayIndex: number) => {
        if (selectedDays.includes(dayIndex)) {
            // Don't allow unselecting the last day
            if (selectedDays.length > 1) {
                setSelectedDays(selectedDays.filter(d => d !== dayIndex));
            }
        } else {
            setSelectedDays([...selectedDays, dayIndex]);
        }
    };

    const handleSubmit = () => {
        onSubmit?.(generatedDates);
        onOpenChange(false);
        toast.success(`Created ${generatedDates.length} recurring bookings`);
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Repeat className="h-5 w-5" />
                        Recurring Booking
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Settings */}
                    <div className="space-y-6">
                        {/* Initial Details */}
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-sm">
                            <p><span className="font-medium">Service:</span> {serviceName}</p>
                            <p><span className="font-medium">Start:</span> {format(initialDate, "MMM d, yyyy")} at {initialTime}</p>
                        </div>

                        {/* Frequency */}
                        <div className="space-y-3">
                            <Label>Frequency</Label>
                            <Select
                                value={frequency}
                                onValueChange={(v: RecurrenceFrequency) => setFrequency(v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Interval */}
                        <div className="flex items-center gap-3">
                            <Label className="whitespace-nowrap">Repeat every</Label>
                            <Input
                                type="number"
                                min={1}
                                max={12}
                                value={interval}
                                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                                className="w-20"
                            />
                            <span className="text-sm text-gray-500">
                                {frequency === "daily" ? "days" : frequency === "weekly" ? "weeks" : "months"}
                            </span>
                        </div>

                        {/* Weekly Specific: Days */}
                        {frequency === "weekly" && (
                            <div className="space-y-2">
                                <Label>On these days</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {weekDays.map((day, index) => (
                                        <div
                                            key={day}
                                            onClick={() => toggleDay(index)}
                                            className={`
                        w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-colors
                        ${selectedDays.includes(index)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}
                      `}
                                        >
                                            {day.charAt(0)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* End Condition */}
                        <div className="space-y-3">
                            <Label>End</Label>
                            <RadioGroup
                                value={endCondition}
                                onValueChange={(v) => setEndCondition(v as EndCondition)}
                                className="space-y-2"
                            >
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="count" id="end-count" />
                                    <Label htmlFor="end-count" className="font-normal">After</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={52}
                                        value={occurrences}
                                        onChange={(e) => setOccurrences(parseInt(e.target.value) || 1)}
                                        disabled={endCondition !== "count"}
                                        className="w-20 h-8"
                                    />
                                    <span className="text-sm text-gray-500">occurrences</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="date" id="end-date" />
                                    <Label htmlFor="end-date" className="font-normal">On date</Label>
                                    <div className={endCondition !== "date" ? "opacity-50 pointer-events-none" : ""}>
                                        {/* Simple date display for MVP, would be a picker */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // In a real app, this opens a popover calendar
                                                // For MVP, we just set it to +1 month if undefined
                                                if (!endDate) setEndDate(addMonths(initialDate, 1));
                                            }}
                                        >
                                            {endDate ? format(endDate, "MMM d, yyyy") : "Select date"}
                                        </Button>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="border-l pl-6 flex flex-col h-full">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            Summary & Preview
                        </h3>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                This will create <span className="font-bold">{generatedDates.length} bookings</span> starting from {format(initialDate, "MMM d")}.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto border rounded-md p-2 max-h-[300px]">
                            {generatedDates.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No dates generated</p>
                            ) : (
                                <div className="space-y-1">
                                    {generatedDates.map((date, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                                            <span className="flex items-center gap-2">
                                                <span className="text-gray-400 w-6">#{i + 1}</span>
                                                {format(date, "EEEE, MMMM d, yyyy")}
                                            </span>
                                            <span className="text-gray-500">{initialTime}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                                Confirm Schedule
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
