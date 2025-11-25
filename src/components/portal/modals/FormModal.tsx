/**
 * FormModal Component - Modal with form-specific features
 * 
 * Features:
 * - Extends BaseModal with form handling
 * - Submit/cancel footer pattern
 * - Loading states
 * - Validation state support
 * - Auto-submits on Enter key
 */

"use client";

import React, { FormEvent, ReactNode } from "react";
import { BaseModal, BaseModalProps } from "./BaseModal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export interface FormModalProps extends Omit<BaseModalProps, "children"> {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
    submitLabel?: string;
    cancelLabel?: string;
    isSubmitting?: boolean;
    isValid?: boolean;
    submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    children: ReactNode;
    showCancelButton?: boolean;
}

/**
 * FormModal Component
 * Provides a consistent form modal pattern with submit/cancel actions
 */
export function FormModal({
    onSubmit,
    submitLabel = "Submit",
    cancelLabel = "Cancel",
    isSubmitting = false,
    isValid = true,
    submitVariant = "default",
    children,
    showCancelButton = true,
    onClose,
    ...baseProps
}: FormModalProps) {
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isSubmitting || !isValid) return;

        await onSubmit(e);
    };

    return (
        <BaseModal {...baseProps} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {children}

                <DialogFooter className="">
                    {showCancelButton && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            {cancelLabel}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant={submitVariant}
                        disabled={!isValid || isSubmitting}
                        className="min-w-24"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {submitLabel}
                    </Button>
                </DialogFooter>
            </form>
        </BaseModal>
    );
}
