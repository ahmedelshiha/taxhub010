/**
 * LoadingButton Component - Button with loading state
 * 
 * Features:
 * - Standardized loading state pattern
 * - Spinner icon
 * - Disabled state logic
 * - Multiple variants
 */

"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    children: React.ReactNode;
}

/**
 * LoadingButton Component
 * A button component that displays a loading spinner when in loading state
 */
export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
    (
        {
            isLoading = false,
            loadingText,
            variant = "default",
            size = "default",
            disabled,
            className,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                disabled={disabled || isLoading}
                className={cn(className)}
                {...props}
            >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isLoading && loadingText ? loadingText : children}
            </Button>
        );
    }
);

LoadingButton.displayName = "LoadingButton";
