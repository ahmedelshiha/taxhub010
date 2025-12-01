/**
 * StatusMessage Component
 * Displays status messages with different variants and optional actions
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import {
    AlertCircle,
    CheckCircle,
    InfoIcon,
    AlertTriangle,
    XCircle
} from 'lucide-react'

export interface StatusMessageProps {
    variant?: 'default' | 'info' | 'success' | 'warning' | 'error'
    title?: string
    children: React.ReactNode
    actions?: React.ReactNode
    className?: string
}

const variantConfig = {
    default: {
        icon: InfoIcon,
        styles: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900',
        iconStyles: 'text-gray-600 dark:text-gray-400',
    },
    info: {
        icon: InfoIcon,
        styles: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20',
        iconStyles: 'text-blue-600 dark:text-blue-400',
    },
    success: {
        icon: CheckCircle,
        styles: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20',
        iconStyles: 'text-green-600 dark:text-green-400',
    },
    warning: {
        icon: AlertTriangle,
        styles: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20',
        iconStyles: 'text-orange-600 dark:text-orange-400',
    },
    error: {
        icon: XCircle,
        styles: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20',
        iconStyles: 'text-red-600 dark:text-red-400',
    },
}

export function StatusMessage({
    variant = 'default',
    title,
    children,
    actions,
    className
}: StatusMessageProps) {
    const config = variantConfig[variant]
    const Icon = config.icon

    return (
        <Alert className={cn(config.styles, className)}>
            <Icon className={cn('h-5 w-5', config.iconStyles)} />
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription className="mt-2">
                {children}
            </AlertDescription>
            {actions && (
                <div className="mt-4 flex items-center gap-2">
                    {actions}
                </div>
            )}
        </Alert>
    )
}
