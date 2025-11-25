/**
 * BookingRescheduleModal Component - Reschedule existing booking
 * 
 * Features:
 * - Display current booking details
 * - New date/time picker
 * - Show availability conflicts
 * - Reschedule reason field
 * - Confirmation flow
 * - Send notification to staff
 */

"use client";

import React, { useState, FormEvent } from "react";
import { FormModal } from "./FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Booking, BookingRescheduleRequest } from "@/types/shared/entities/booking";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Calendar, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/shared/formatters";

export interface BookingRescheduleModalProps {
    open: boolean;
    onClose: () => void;
    booking: Booking | null;
    onSuccess?: () => void;
}

/**
 * BookingRescheduleModal Component
 */
export function BookingRescheduleModal({
    open,
    onClose,
    booking,
    onSuccess,
}: BookingRescheduleModalProps) {
    const [newScheduledAt, setNewScheduledAt] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!booking) return null;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!newScheduledAt) {
            newErrors.newScheduledAt = "Please select a new date and time";
        }

        // Check if new date is the same as current
        if (newScheduledAt && newScheduledAt === booking.scheduledAt) {
            newErrors.newScheduledAt = "New date must be different from current date";
        }

        // Check if date is in the past
        if (newScheduledAt && new Date(newScheduledAt) < new Date()) {
            newErrors.newScheduledAt = "Cannot reschedule to a past date";
        }

        // Check if booking is too far in the future
        if (newScheduledAt) {
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
            if (new Date(newScheduledAt) > sixMonthsFromNow) {
                newErrors.newScheduledAt = "Cannot reschedule more than 6 months in advance";
            }
        }

        // Check if within 24 hours of current booking
        if (newScheduledAt && booking.scheduledAt) {
            const currentDate = new Date(booking.scheduledAt);
            const now = new Date();
            const hoursDiff = (currentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursDiff < 24 && hoursDiff > 0) {
                // Warning but not blocking
                toast.info("Note: Rescheduling within 24 hours may incur fees");
            }
        }

        if (reason && reason.length > 500) {
            newErrors.reason = "Reason must not exceed 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the form errors");
            return;
        }

        setIsSubmitting(true);
        try {
            const requestData: BookingRescheduleRequest = {
                bookingId: booking.id,
                newScheduledAt,
                reason: reason || undefined,
            };

            const response = await apiFetch(`/api/bookings/${booking.id}/reschedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to reschedule booking");
            }

            toast.success("Booking rescheduled successfully!");
            onSuccess?.();
            onClose();

            // Reset form
            setNewScheduledAt("");
            setReason("");
            setErrors({});
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to reschedule booking"
            );
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = newScheduledAt && newScheduledAt !== booking.scheduledAt;

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title="Reschedule Booking"
            description="Choose a new date and time for your appointment"
            size="md"
            onSubmit={handleSubmit}
            submitLabel="Reschedule Booking"
            isSubmitting={isSubmitting}
            isValid={!!isValid}
        >
            <div className="space-y-4">
                {/* Current Booking Details */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Current Booking
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Service:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {booking.service?.name || "N/A"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Date & Time:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatDate(booking.scheduledAt)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Duration:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {booking.duration} minutes
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Status:
                            </span>
                            <Badge variant="secondary">{booking.status}</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>

                {/* New Date and Time */}
                <div className="space-y-2">
                    <Label htmlFor="reschedule-datetime">
                        New Date & Time <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                        <Input
                            id="reschedule-datetime"
                            type="datetime-local"
                            value={newScheduledAt}
                            onChange={(e) => {
                                setNewScheduledAt(e.target.value);
                                if (errors.newScheduledAt) {
                                    setErrors({ ...errors, newScheduledAt: "" });
                                }
                            }}
                            min={new Date().toISOString().slice(0, 16)}
                            className={cn("pl-10", errors.newScheduledAt && "border-red-500")}
                            required
                        />
                    </div>
                    {errors.newScheduledAt && (
                        <p className="text-sm text-red-500">{errors.newScheduledAt}</p>
                    )}
                </div>

                {/* Reason for Rescheduling */}
                <div className="space-y-2">
                    <Label htmlFor="reschedule-reason">
                        Reason for Rescheduling (Optional)
                    </Label>
                    <Textarea
                        id="reschedule-reason"
                        placeholder="Let us know why you need to reschedule (optional)"
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            if (errors.reason) {
                                setErrors({ ...errors, reason: "" });
                            }
                        }}
                        rows={3}
                        className={cn("resize-none", errors.reason && "border-red-500")}
                        maxLength={500}
                    />
                    {errors.reason && (
                        <p className="text-sm text-red-500">{errors.reason}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        {reason.length}/500 characters
                    </p>
                </div>

                {/* Important Notice */}
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Important:</strong> Rescheduling within 24 hours of your
                            appointment may be subject to fees or restrictions. You will
                            receive a confirmation email once the reschedule is processed.
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Confirmation Message */}
                {newScheduledAt && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Your appointment will be moved to{" "}
                            <strong>{new Date(newScheduledAt).toLocaleString()}</strong>
                        </p>
                    </div>
                )}
            </div>
        </FormModal>
    );
}
