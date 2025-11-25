/**
 * BaseModal Component - Foundation for all portal modals
 * 
 * Features:
 * - Responsive sizing (sm, md, lg, xl)
 * - Progress indicator support
 * - Estimated time badge
 * - Focus trap and keyboard navigation
 * - Escape key handler
 * - Accessibility compliant (WCAG 2.1 AA)
 */

"use client";

import React, { ReactNode, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProgressIndicatorProps {
    current: number;
    total: number;
    steps?: string[];
}

export interface BaseModalProps {
    open: boolean;
    onClose: () => void;
    title: ReactNode | string;
    description?: string;
    size?: "sm" | "md" | "lg" | "xl";
    showProgress?: ProgressIndicatorProps;
    estimatedMinutes?: number;
    children: ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

/**
 * Progress Indicator Component
 * Shows step-by-step progress for multi-step modals
 */
function ProgressIndicator({ current, total, steps }: ProgressIndicatorProps) {
    const progressPercentage = (current / total) * 100;

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Step {current} of {total}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(progressPercentage)}% complete
                </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {steps && steps.length > 0 && (
                <div className="flex justify-between mt-2">
                    {steps.map((step, index) => (
                        <span
                            key={index}
                            className={cn(
                                "text-xs",
                                index < current
                                    ? "text-green-600 dark:text-green-400 font-medium"
                                    : index === current - 1
                                        ? "text-blue-600 dark:text-blue-400 font-medium"
                                        : "text-gray-500 dark:text-gray-400"
                            )}
                        >
                            {step}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * BaseModal Component
 * Provides a consistent foundation for all portal modals
 */
export function BaseModal({
    open,
    onClose,
    title,
    description,
    size = "md",
    showProgress,
    estimatedMinutes,
    children,
    className,
    showCloseButton = true,
}: BaseModalProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        if (!open) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open, onClose]);

    // Size classes mapping
    const sizeClasses = {
        sm: "sm:max-w-md",
        md: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        xl: "sm:max-w-4xl",
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                className={cn(
                    sizeClasses[size],
                    "max-h-[90vh]",
                    className
                )}
                showCloseButton={showCloseButton}
                ref={contentRef}
            >
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle>{title}</DialogTitle>
                            {description && (
                                <DialogDescription className="mt-1">
                                    {description}
                                </DialogDescription>
                            )}
                        </div>
                        {estimatedMinutes && (
                            <Badge variant="secondary" className="ml-2 shrink-0">
                                <Clock className="h-3 w-3 mr-1" />
                                {estimatedMinutes} min
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                {showProgress && (
                    <ProgressIndicator
                        current={showProgress.current}
                        total={showProgress.total}
                        steps={showProgress.steps}
                    />
                )}

                <div className="overflow-y-auto flex-1 px-1">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
