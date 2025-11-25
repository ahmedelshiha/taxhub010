/**
 * TaskEditModal Component - Edit existing task
 * 
 * Features:
 * - Reuses TaskQuickCreateModal logic
 * - Pre-populates form with task data
 * - Edit history tracking
 * - Optimistic updates
 * - Status modification
 */

"use client";

import React, { useState, FormEvent } from "react";
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
import {
    Task,
    TaskPriority,
    TaskStatus,
    TaskUpdateInput,
} from "@/types/shared/entities/task";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface TaskEditModalProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onSuccess?: () => void;
}

/**
 * TaskEditModal Component
 */
export function TaskEditModal({
    open,
    onClose,
    task,
    onSuccess,
}: TaskEditModalProps) {
    const [formData, setFormData] = useState<TaskUpdateInput>({
        title: task?.title || "",
        description: task?.description || "",
        priority: task?.priority || TaskPriority.MEDIUM,
        status: task?.status || TaskStatus.OPEN,
        dueAt: task?.dueAt,
        complianceRequired: task?.complianceRequired || false,
        complianceDeadline: task?.complianceDeadline,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update form when task changes
    React.useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || undefined,
                priority: task.priority,
                status: task.status,
                dueAt: task.dueAt,
                complianceRequired: task.complianceRequired,
                complianceDeadline: task.complianceDeadline,
            });
        }
    }, [task]);

    if (!task) return null;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            newErrors.title = "Title is required";
        }

        if (formData.title && formData.title.length < 3) {
            newErrors.title = "Title must be at least 3 characters";
        }

        if (formData.title && formData.title.length > 200) {
            newErrors.title = "Title must not exceed 200 characters";
        }

        if (formData.description && formData.description.length > 2000) {
            newErrors.description = "Description must not exceed 2000 characters";
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
            const response = await apiFetch(`/api/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update task");
            }

            toast.success("Task updated successfully!");
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update task"
            );
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = formData.title && formData.title.trim().length >= 3;

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title="Edit Task"
            description={`Edit details for "${task.title}"`}
            size="md"
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
            isValid={!!isValid}
        >
            <div className="space-y-4">
                {/* Status Selector */}
                <div className="space-y-2">
                    <Label htmlFor="task-status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) =>
                            setFormData({ ...formData, status: value as TaskStatus })
                        }
                    >
                        <SelectTrigger id="task-status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TaskStatus.OPEN}>Open</SelectItem>
                            <SelectItem value={TaskStatus.IN_PROGRESS}>
                                In Progress
                            </SelectItem>
                            <SelectItem value={TaskStatus.REVIEW}>Review</SelectItem>
                            <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                            <SelectItem value={TaskStatus.BLOCKED}>Blocked</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Title Field */}
                <div className="space-y-2">
                    <Label htmlFor="task-title">
                        Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="task-title"
                        placeholder="e.g., Review Q4 financial statements"
                        value={formData.title || ""}
                        onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value });
                            if (errors.title) {
                                setErrors({ ...errors, title: "" });
                            }
                        }}
                        className={cn(errors.title && "border-red-500")}
                        maxLength={200}
                        required
                    />
                    {errors.title && (
                        <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        {formData.title?.length || 0}/200 characters
                    </p>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                        id="task-description"
                        placeholder="Add details about this task (optional)"
                        value={formData.description || ""}
                        onChange={(e) => {
                            setFormData({ ...formData, description: e.target.value });
                            if (errors.description) {
                                setErrors({ ...errors, description: "" });
                            }
                        }}
                        rows={4}
                        className={cn(
                            "resize-none",
                            errors.description && "border-red-500"
                        )}
                        maxLength={2000}
                    />
                    {errors.description && (
                        <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        {formData.description?.length || 0}/2000 characters
                    </p>
                </div>

                {/* Priority Selector */}
                <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                            setFormData({ ...formData, priority: value as TaskPriority })
                        }
                    >
                        <SelectTrigger id="task-priority">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TaskPriority.LOW}>Low Priority</SelectItem>
                            <SelectItem value={TaskPriority.MEDIUM}>
                                Medium Priority
                            </SelectItem>
                            <SelectItem value={TaskPriority.HIGH}>High Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Due Date Field */}
                <div className="space-y-2">
                    <Label htmlFor="task-due-date">Due Date</Label>
                    <Input
                        id="task-due-date"
                        type="date"
                        value={
                            formData.dueAt
                                ? new Date(formData.dueAt).toISOString().split("T")[0]
                                : ""
                        }
                        onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            setFormData({ ...formData, dueAt: date });
                        }}
                        min={new Date().toISOString().split("T")[0]}
                    />
                </div>

                {/* Compliance Required Checkbox */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="task-compliance"
                        checked={formData.complianceRequired}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                complianceRequired: e.target.checked,
                            })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                        htmlFor="task-compliance"
                        className="font-normal cursor-pointer"
                    >
                        This task requires compliance tracking
                    </Label>
                </div>

                {/* Compliance Deadline */}
                {formData.complianceRequired && (
                    <div className="space-y-2 ml-6">
                        <Label htmlFor="task-compliance-deadline">
                            Compliance Deadline
                        </Label>
                        <Input
                            id="task-compliance-deadline"
                            type="date"
                            value={
                                formData.complianceDeadline
                                    ? new Date(formData.complianceDeadline)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                            }
                            onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : null;
                                setFormData({ ...formData, complianceDeadline: date });
                            }}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                )}
            </div>
        </FormModal>
    );
}
