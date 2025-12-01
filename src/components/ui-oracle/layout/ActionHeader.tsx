/**
 * ActionHeader - Oracle Fusion Style Page Header
 * 
 * Standard page header with:
 * - Page title and description
 * - Primary action button
 * - Secondary action buttons
 * - Breadcrumb integration
 * - Responsive layout
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ActionHeaderProps {
    /** Page title */
    title: string

    /** Optional description */
    description?: string

    /** Primary action (button or custom JSX) */
    primaryAction?: React.ReactNode

    /** Secondary actions (buttons or custom JSX) */
    secondaryActions?: React.ReactNode

    /** Breadcrumbs component */
    breadcrumbs?: React.ReactNode

    /** Additional content (e.g., tabs) */
    children?: React.ReactNode

    /** Additional CSS classes */
    className?: string
}

export function ActionHeader({
    title,
    description,
    primaryAction,
    secondaryActions,
    breadcrumbs,
    children,
    className,
}: ActionHeaderProps) {
    return (
        <div className={cn('mb-6 space-y-4', className)}>
            {/* Breadcrumbs */}
            {breadcrumbs && (
                <div>{breadcrumbs}</div>
            )}

            {/* Title and Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {(primaryAction || secondaryActions) && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {secondaryActions && (
                            <div className="flex items-center gap-2">
                                {secondaryActions}
                            </div>
                        )}
                        {primaryAction && (
                            <div>
                                {primaryAction}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Additional content (tabs, filters, etc.) */}
            {children && (
                <div>{children}</div>
            )}
        </div>
    )
}
