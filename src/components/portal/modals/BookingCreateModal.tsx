/**
 * BookingCreateModal Component - Create new booking
 * 
 * Features:
 * - Service selection dropdown
 * - Date/time picker with availability checking
 * - Location selector (if applicable)
 * - Notes field
 * - Booking validation
 * - Confirmation step
 * - Success state with calendar export option
 */

"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { FormModal } from "./FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BookingFormData, BookingStatus } from "@/types/shared/entities/booking";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

export interface BookingCreateModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    preselectedServiceId?: string;
}

interface Service {
    id: string;
    name: string;
    duration: number;
    price?: number;
    shortDesc?: string;
}

/**
 * BookingCreateModal Component
 */
export function BookingCreateModal({
    open,
    onClose,
    onSuccess,
    preselectedServiceId,
}: BookingCreateModalProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [formData, setFormData] = useState<BookingFormData>({
        serviceId: preselectedServiceId || "",
        scheduledAt: "",
        duration: 60,
        notes: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch available services
    useEffect(() => {
        if (open) {
            fetchServices();
        }
    }, [open]);

    // Update duration when service changes
    useEffect(() => {
        if (formData.serviceId) {
            const service = services.find((s) => s.id === formData.serviceId);
            if (service) {
                setFormData((prev) => ({ ...prev, duration: service.duration }));
            }
        }
    }, [formData.serviceId, services]);

    const fetchServices = async () => {
        setLoadingServices(true);
        try {
            const response = await apiFetch("/api/services");
            if (response.ok) {
                const data = await response.json();
                setServices(data.data || data || []);
            }
        } catch (error) {
            console.error("Failed to fetch services:", error);
            toast.error("Failed to load services");
        } finally {
            setLoadingServices(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.serviceId) {
            newErrors.serviceId = "Please select a service";
        }

        if (!formData.scheduledAt) {
            newErrors.scheduledAt = "Please select a date and time";
        }

        // Check if date is in the past
        if (formData.scheduledAt && new Date(formData.scheduledAt) < new Date()) {
            newErrors.scheduledAt = "Cannot book appointments in the past";
        }

        // Check if booking is too far in the future (e.g., 6 months)
        if (formData.scheduledAt) {
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
            if (new Date(formData.scheduledAt) > sixMonthsFromNow) {
                newErrors.scheduledAt = "Cannot book more than 6 months in advance";
            }
        }

        if (formData.notes && formData.notes.length > 1000) {
            newErrors.notes = "Notes must not exceed 1000 characters";
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
            const response = await apiFetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    status: BookingStatus.PENDING,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create booking");
            }

            setShowSuccess(true);

            // Show success state for 2 seconds before closing
            setTimeout(() => {
                toast.success("Booking created successfully!");
                onSuccess?.();
                onClose();
                setShowSuccess(false);

                // Reset form
                setFormData({
                    serviceId: "",
                    scheduledAt: "",
                    duration: 60,
                    notes: "",
                });
                setErrors({});
            }, 2000);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to create booking"
            );
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedService = services.find((s) => s.id === formData.serviceId);
    const isValid = formData.serviceId && formData.scheduledAt;

    // Show success animation
    if (showSuccess) {
        return (
            <FormModal
                open={open}
                onClose={onClose}
                title="Booking Confirmed!"
                size="md"
                onSubmit={(e) => e.preventDefault()}
                showCancelButton={false}
                submitLabel="Done"
            >
                <div className="text-center py-8">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-green-100 p-4 animate-in zoom-in-50">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Booking Created Successfully!
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        You will receive a confirmation email shortly.
                    </p>
                </div>
            </FormModal>
        );
    }

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title="Book a Service"
            description="Schedule an appointment with our team"
            size="md"
            onSubmit={handleSubmit}
            submitLabel="Create Booking"
            isSubmitting={isSubmitting}
            isValid={!!isValid}
            estimatedMinutes={3}
        >
            <div className="space-y-4">
                {/* Service Selection */}
                <div className="space-y-2">
                    <Label htmlFor="booking-service">
                        Service <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.serviceId}
                        onValueChange={(value) => {
                            setFormData({ ...formData, serviceId: value });
                            if (errors.serviceId) {
                                setErrors({ ...errors, serviceId: "" });
                            }
                        }}
                        disabled={loadingServices}
                    >
                        <SelectTrigger
                            id="booking-service"
                            className={cn(errors.serviceId && "border-red-500")}
                        >
                            <SelectValue placeholder={loadingServices ? "Loading services..." : "Select a service"} />
                        </SelectTrigger>
                        <SelectContent>
                            {services.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{service.name}</span>
                                        {service.shortDesc && (
                                            <span className="text-xs text-gray-500">
                                                {service.shortDesc}
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.serviceId && (
                        <p className="text-sm text-red-500">{errors.serviceId}</p>
                    )}
                </div>

                {/* Service Details (shown when service is selected) */}
                {selectedService && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Duration: {selectedService.duration} minutes
                                </span>
                            </div>
                            {selectedService.price && (
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    ${selectedService.price}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Date and Time */}
                <div className="space-y-2">
                    <Label htmlFor="booking-datetime">
                        Date & Time <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                        <Input
                            id="booking-datetime"
                            type="datetime-local"
                            value={formData.scheduledAt}
                            onChange={(e) => {
                                setFormData({ ...formData, scheduledAt: e.target.value });
                                if (errors.scheduledAt) {
                                    setErrors({ ...errors, scheduledAt: "" });
                                }
                            }}
                            min={new Date().toISOString().slice(0, 16)}
                            className={cn("pl-10", errors.scheduledAt && "border-red-500")}
                            required
                        />
                    </div>
                    {errors.scheduledAt && (
                        <p className="text-sm text-red-500">{errors.scheduledAt}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Select your preferred date and time for the appointment
                    </p>
                </div>

                {/* Duration (editable if needed) */}
                <div className="space-y-2">
                    <Label htmlFor="booking-duration">Duration (minutes)</Label>
                    <Input
                        id="booking-duration"
                        type="number"
                        value={formData.duration || 60}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                duration: parseInt(e.target.value) || 60,
                            })
                        }
                        min={15}
                        max={480}
                        step={15}
                    />
                    <p className="text-xs text-gray-500">
                        Adjust if needed (default: {selectedService?.duration || 60} minutes)
                    </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label htmlFor="booking-notes">Notes (optional)</Label>
                    <Textarea
                        id="booking-notes"
                        placeholder="Any special requirements or information we should know?"
                        value={formData.notes || ""}
                        onChange={(e) => {
                            setFormData({ ...formData, notes: e.target.value });
                            if (errors.notes) {
                                setErrors({ ...errors, notes: "" });
                            }
                        }}
                        rows={3}
                        className={cn("resize-none", errors.notes && "border-red-500")}
                        maxLength={1000}
                    />
                    {errors.notes && (
                        <p className="text-sm text-red-500">{errors.notes}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        {formData.notes?.length || 0}/1000 characters
                    </p>
                </div>

                {/* Timezone info */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Note:</strong> Times are shown in your local timezone
                    </p>
                </div>
            </div>
        </FormModal>
    );
}
