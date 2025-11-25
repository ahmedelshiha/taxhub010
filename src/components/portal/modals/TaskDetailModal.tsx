/**
 * TaskDetailModal Component - View full task details
 * 
 * Features:
 * - Display full task information
 * - Show task history timeline
 * - Display file attachments with preview
 * - Add comment section
 * - Status badge display
 * - Keyboard shortcut support (Esc to close)
 */

"use client";

import React, { useState } from "react";
import { BaseModal } from "./BaseModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    Task,
    TaskStatus,
    TaskPriority,
    TaskComment as TaskCommentType,
} from "@/types/shared/entities/task";
import {
    Calendar,
    User,
    MessageSquare,
    FileText,
    Clock,
    AlertCircle,
    CheckCircle2,
    Send,
} from "lucide-react";
import { formatDate } from "@/lib/shared/formatters";
import { apiFetch } from "@/lib/api";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { cn } from "@/lib/utils";

export interface TaskDetailModalProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onUpdate?: () => void;
}

/**
 * Priority Badge Component
 */
function PriorityBadge({ priority }: { priority: TaskPriority }) {
    const variants = {
        LOW: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        HIGH: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    };

    return (
        <Badge className={cn("font-medium", variants[priority])}>
            {priority}
        </Badge>
    );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: TaskStatus }) {
    const variants = {
        OPEN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        REVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
        COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        BLOCKED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    };

    const labels = {
        OPEN: "Open",
        IN_PROGRESS: "In Progress",
        REVIEW: "Review",
        COMPLETED: "Completed",
        BLOCKED: "Blocked",
    };

    return (
        <Badge className={cn("font-medium", variants[status])}>
            {labels[status]}
        </Badge>
    );
}

/**
 * Comment Component
 */
function TaskComment({ comment }: { comment: TaskCommentType }) {
    return (
        <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {comment.author?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt.toString())}
                    </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                </p>
            </div>
        </div>
    );
}

/**
 * TaskDetailModal Component
 */
export function TaskDetailModal({
    open,
    onClose,
    task,
    onUpdate,
}: TaskDetailModalProps) {
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!task) return null;

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiFetch(`/api/tasks/${task.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment }),
            });

            if (!response.ok) {
                throw new Error("Failed to add comment");
            }

            toast.success("Comment added successfully");
            setNewComment("");
            onUpdate?.();
        } catch (error) {
            toast.error("Failed to add comment");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDueToday = task.dueAt
        ? new Date(task.dueAt).toDateString() === new Date().toDateString()
        : false;

    const isOverdue = task.dueAt
        ? new Date(task.dueAt) < new Date() && task.status !== TaskStatus.COMPLETED
        : false;

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title={task.title}
            description="View task details and add comments"
            size="lg"
        >
            <div className="space-y-6">
                {/* Status and Priority */}
                <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    {isOverdue && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                        </Badge>
                    )}
                    {isDueToday && !isOverdue && (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                            <Clock className="h-3 w-3 mr-1" />
                            Due Today
                        </Badge>
                    )}
                </div>

                {/* Description */}
                {task.description && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Description
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {task.description}
                        </p>
                    </div>
                )}

                {/* Task Details */}
                <div className="grid grid-cols-2 gap-4">
                    {task.dueAt && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Due Date
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {formatDate(task.dueAt.toString())}
                                </p>
                            </div>
                        </div>
                    )}

                    {task.assignee && (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Assigned To
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {task.assignee.name || task.assignee.email}
                                </p>
                            </div>
                        </div>
                    )}

                    {task.complianceRequired && (
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Compliance
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Required
                                    {task.complianceDeadline && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            (by {formatDate(task.complianceDeadline.toString())})
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatDate(task.createdAt.toString())}
                            </p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Comments Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Comments ({task.comments?.length || 0})
                        </h4>
                    </div>

                    {/* Comments List */}
                    {task.comments && task.comments.length > 0 ? (
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                            {task.comments.map((comment) => (
                                <TaskComment key={comment.id} comment={comment} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center py-4">
                            No comments yet. Be the first to comment!
                        </p>
                    )}

                    {/* Add Comment */}
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                        <div className="flex justify-end">
                            <LoadingButton
                                onClick={handleAddComment}
                                isLoading={isSubmitting}
                                disabled={!newComment.trim() || isSubmitting}
                                size="sm"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Add Comment
                            </LoadingButton>
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
