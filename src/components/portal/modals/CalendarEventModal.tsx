"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText, AlertCircle, Pencil, Trash2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: "booking" | "task" | "compliance";
    resource: any;
}

interface CalendarEventModalProps {
    event: CalendarEvent | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (event: CalendarEvent) => void;
    onDelete?: (event: CalendarEvent) => void;
}

export default function CalendarEventModal({
    event,
    open,
    onOpenChange,
    onEdit,
    onDelete,
}: CalendarEventModalProps) {
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    if (!event) return null;

    const handleEdit = () => {
        onEdit?.(event);
        onOpenChange(false);
    };

    const handleDelete = () => {
        if (deleteConfirm) {
            onDelete?.(event);
            onOpenChange(false);
            setDeleteConfirm(false);
        } else {
            setDeleteConfirm(true);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(false);
    };

    // Type-specific badge color
    const typeColors = {
        booking: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        task: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
        compliance: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
    };

    const typeLabels = {
        booking: "Booking",
        task: "Task",
        compliance: "Compliance",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-4 sm:p-6">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="text-xl sm:text-2xl">{event.title}</DialogTitle>
                            <Badge className={`mt-2 ${typeColors[event.type]}`} variant="secondary">
                                {typeLabels[event.type]}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {format(event.start, "EEEE, MMMM d, yyyy")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Type-Specific Content */}
                    {event.type === "booking" && (
                        <BookingDetails resource={event.resource} />
                    )}

                    {event.type === "task" && (
                        <TaskDetails resource={event.resource} />
                    )}

                    {event.type === "compliance" && (
                        <ComplianceDetails resource={event.resource} />
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        {deleteConfirm ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <span className="text-sm text-red-600 font-medium">
                                        Confirm deletion?
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1" />
                        )}

                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                            {deleteConfirm ? (
                                <>
                                    <Button variant="outline" size="sm" onClick={cancelDelete}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Confirm Delete
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {onEdit && (
                                        <Button variant="outline" size="sm" onClick={handleEdit}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button variant="outline" size="sm" onClick={handleDelete}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Booking-specific details
function BookingDetails({ resource }: { resource: any }) {
    const statusColors = {
        PENDING: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        CONFIRMED: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        CANCELLED: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
        COMPLETED: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    };

    return (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white">Booking Details</h4>

            <div className="grid gap-3">
                {resource.clientName && (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Client: <span className="font-medium text-gray-900 dark:text-white">{resource.clientName}</span>
                        </span>
                    </div>
                )}

                {resource.status && (
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <Badge className={statusColors[resource.status as keyof typeof statusColors] || statusColors.PENDING} variant="secondary">
                            {resource.status}
                        </Badge>
                    </div>
                )}
            </div>
        </div>
    );
}

// Task-specific details
function TaskDetails({ resource }: { resource: any }) {
    const priorityColors = {
        LOW: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200",
        MEDIUM: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        HIGH: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
        URGENT: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };

    const statusColors = {
        PENDING: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200",
        IN_PROGRESS: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
        COMPLETED: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        CANCELLED: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };

    return (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white">Task Details</h4>

            <div className="grid gap-3">
                {resource.description && (
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description}</p>
                    </div>
                )}

                <div className="flex items-center gap-4 flex-wrap">
                    {resource.priority && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                            <Badge className={priorityColors[resource.priority as keyof typeof priorityColors] || priorityColors.MEDIUM} variant="secondary">
                                {resource.priority}
                            </Badge>
                        </div>
                    )}

                    {resource.status && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                            <Badge className={statusColors[resource.status as keyof typeof statusColors] || statusColors.PENDING} variant="secondary">
                                {resource.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Compliance-specific details
function ComplianceDetails({ resource }: { resource: any }) {
    return (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white">Compliance Details</h4>

            <div className="grid gap-3">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Document: <span className="font-medium text-gray-900 dark:text-white">{resource.filename}</span>
                    </span>
                </div>

                {resource.deadline && (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Deadline: <span className="font-medium text-orange-600 dark:text-orange-400">
                                {format(new Date(resource.deadline), "MMMM d, yyyy")}
                            </span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
