/**
 * BookingCancelModal Component - Cancel booking
 * 
 * Features:
 * - Display booking details
 * - Cancellation reason dropdown
 * - Confirmation step
 * - Show cancellation policy (if applicable)
 * - Refund status display
 */

"use client";

import React, { useState, FormEvent } from "react";
import { FormModal } from "./FormModal";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Booking, BookingCancellationRequest } from "@/types/shared/entities/booking";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/shared/formatters";

export interface BookingCancelModalProps {
    open: boolean;
    onClose: () => void;
    booking: Booking | null;
    onSuccess?: () => void;
}

const CANCELLATION_REASONS = [
    { value: "schedule_conflict", label: "Schedule Conflict" },
    { value: "no_longer_needed", label: "No Longer Needed" },
    { value: "found_alternative", label: "Found Alternative Provider" },
    { value: "personal_reasons", label: "Personal Reasons" },
    { value: "emergency", label: "Emergency" },
    { value: "other", label: "Other" },
];

/**
 * BookingCancelModal Component
 */
export function BookingCancelModal({
    open,
    onClose,
    booking,
    onSuccess,
}: BookingCancelModalProps) {
    const [reason, setReason] = useState("");
    const [additionalDetails, setAdditionalDetails] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!booking) return null;

    // Calculate hours until booking
    const hoursUntilBooking = booking.scheduledAt
        ? (new Date(booking.scheduledAt).getTime() - new Date().getTime()) /
        (1000 * 60 * 60)
        : 0;

    const isWithin24Hours = hoursUntilBooking > 0 && hoursUntilBooking < 24;
    const refundEligible = hoursUntilBooking >= 24;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!reason) {
            newErrors.reason = "Please select a cancellation reason";
        }

        if (!confirmed) {
            newErrors.confirmed = "Please confirm you want to cancel this booking";
        }

        if (additionalDetails && additionalDetails.length > 500) {
            newErrors.additionalDetails =
                "Additional details must not exceed 500 characters";
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
            const requestData: BookingCancellationRequest = {
                bookingId: booking.id,
                reason: `${reason}${additionalDetails ? `: ${additionalDetails}` : ""}`,
                refundPercentage: refundEligible ? 100 : 0,
            };

            const response = await apiFetch(`/api/bookings/${booking.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to cancel booking");
            }

            toast.success("Booking cancelled successfully");
            onSuccess?.();
            onClose();

            // Reset form
            setReason("");
            setAdditionalDetails("");
            setConfirmed(false);
            setErrors({});
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to cancel booking"
            );
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = reason && confirmed;

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title="Cancel Booking"
            description="We're sorry to see you go. Please help us understand why."
            size="md"
            onSubmit={handleSubmit}
            submitLabel="Cancel Booking"
            submitVariant="destructive"
            isSubmitting={isSubmitting}
            isValid={!!isValid}
        >
            <div className="space-y-4">
                {/* Booking Details */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Booking Details
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

                {/* Cancellation Policy Warning */}
                {isWithin24Hours && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                            <div className="text-sm text-red-800 dark:text-red-200">
                                <strong>Late Cancellation:</strong> You are cancelling within 24
                                hours of your appointment. This may not be eligible for a refund
                                according to our cancellation policy.
                            </div>
                        </div>
                    </div>
                )}

                {refundEligible && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex gap-2">
                            <Info className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                            <div className="text-sm text-green-800 dark:text-green-200">
                                <strong>Full Refund Eligible:</strong> You are cancelling more
                                than 24 hours in advance. You will receive a full refund if
                                applicable.
                            </div>
                        </div>
                    </div>
                )}

                <Separator />

                {/* Cancellation Reason */}
                <div className="space-y-2">
                    <Label htmlFor="cancel-reason">
                        Reason for Cancellation <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={reason}
                        onValueChange={(value) => {
                            setReason(value);
                            if (errors.reason) {
                                setErrors({ ...errors, reason: "" });
                            }
                        }}
                    >
                        <SelectTrigger
                            id="cancel-reason"
                            className={cn(errors.reason && "border-red-500")}
                        >
                            <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                            {CANCELLATION_REASONS.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                    {r.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.reason && (
                        <p className="text-sm text-red-500">{errors.reason}</p>
                    )}
                </div>

                {/* Additional Details */}
                <div className="space-y-2">
                    <Label htmlFor="cancel-details">
                        Additional Details (Optional)
                    </Label>
                    <Textarea
                        id="cancel-details"
                        placeholder="Please provide any additional information (optional)"
                        value={additionalDetails}
                        onChange={(e) => {
                            setAdditionalDetails(e.target.value);
                            if (errors.additionalDetails) {
                                setErrors({ ...errors, additionalDetails: "" });
                            }
                        }}
                        rows={3}
                        className={cn(
                            "resize-none",
                            errors.additionalDetails && "border-red-500"
                        )}
                        maxLength={500}
                    />
                    {errors.additionalDetails && (
                        <p className="text-sm text-red-500">{errors.additionalDetails}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        {additionalDetails.length}/500 characters
                    </p>
                </div>

                <Separator />

                {/* Confirmation Checkbox */}
                <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                        <input
                            type="checkbox"
                            id="cancel-confirm"
                            checked={confirmed}
                            onChange={(e) => {
                                setConfirmed(e.target.checked);
                                if (errors.confirmed) {
                                    setErrors({ ...errors, confirmed: "" });
                                }
                            }}
                            className={cn(
                                "h-4 w-4 mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500",
                                errors.confirmed && "border-red-500"
                            )}
                        />
                        <Label
                            htmlFor="cancel-confirm"
                            className="font-normal cursor-pointer text-sm"
                        >
                            I understand that cancelling this booking is permanent and cannot
                            be undone. I have read and agree to the cancellation policy.
                        </Label>
                    </div>
                    {errors.confirmed && (
                        <p className="text-sm text-red-500 ml-6">{errors.confirmed}</p>
                    )}
                </div>

                {/* Final Warning */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Note:</strong> After cancellation, you will receive a
                        confirmation email. If you wish to rebook, you will need to create a
                        new booking.
                    </p>
                </div>
            </div>
        </FormModal>
    );
}
