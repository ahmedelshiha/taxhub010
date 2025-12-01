/**
 * StatusMessage - User Feedback Message
 * 
 * Inline message component for user feedback:
 * - Info, warning, error, success variants
 * - Optional icon
 * - Dismissible option
 * - Accessible
 */

import React from 'react'
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type MessageVariant = 'info' | 'success' | 'warning' | 'error'

export interface StatusMessageProps {
    /** Message variant */
    variant: MessageVariant

    /** Message title */
    title?: string

    /** Message content */
    children: React.ReactNode

    /** Whether message is dismissible */
    dismissible?: boolean

    /** Callback when dismissed */
    onDismiss?: () => void

    /** Additional CSS classes */
    className?: string
}

const variantConfig = {
    info: {
        icon: Info,
        className: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-100',
        iconClassName: 'text-blue-600 dark:text-blue-400',
    },
    success: {
        icon: CheckCircle2,
        className: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-800 dark:text-green-100',
        iconClassName: 'text-green-600 dark:text-green-400',
    },
    warning: {
        icon: AlertCircle,
        className: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-100',
        iconClassName: 'text-yellow-600 dark:text-yellow-400',
    },
    error: {
        icon: XCircle,
        className: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-100',
        iconClassName: 'text-red-600 dark:text-red-400',
    },
}

export function StatusMessage({
    variant,
    title,
    children,
    dismissible = false,
    onDismiss,
    className,
}: StatusMessageProps) {
    const config = variantConfig[variant]
    const Icon = config.icon

    return (
        <div
            className={cn(
                'rounded-lg border p-4',
                config.className,
                className
            )}
            role="alert"
        >
            <div className="flex gap-3">
                <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconClassName)} />
                <div className="flex-1 min-w-0">
                    {title && (
                        <h3 className="font-semibold mb-1">{title}</h3>
                    )}
                    <div className="text-sm">{children}</div>
                </div>
                {dismissible && onDismiss && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className="h-6 w-6 p-0 flex-shrink-0"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Dismiss</span>
                    </Button>
                )}
            </div>
        </div>
    )
}
