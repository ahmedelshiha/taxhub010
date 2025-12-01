/**
 * ContentSection - Reusable Content Container
 * 
 * Standard content section with:
 * - Optional title and description
 * - Optional actions
 * - Consistent padding and spacing
 * - Card styling
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ContentSectionProps {
    /** Section title */
    title?: string

    /** Section description */
    description?: string

    /** Action buttons or components */
    actions?: React.ReactNode

    /** Section content */
    children: React.ReactNode

    /** Disable card styling (transparent) */
    transparent?: boolean

    /** Remove padding */
    noPadding?: boolean

    /** Additional CSS classes */
    className?: string
}

export function ContentSection({
    title,
    description,
    actions,
    children,
    transparent = false,
    noPadding = false,
    className,
}: ContentSectionProps) {
    if (transparent) {
        return (
            <div className={cn('space-y-4', className)}>
                {(title || description || actions) && (
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            {title && (
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {description}
                                </p>
                            )}
                        </div>
                        {actions && <div className="flex-shrink-0">{actions}</div>}
                    </div>
                )}
                <div className={cn(!noPadding && 'space-y-4')}>{children}</div>
            </div>
        )
    }

    return (
        <Card className={className}>
            {(title || description || actions) && (
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                            {title && <CardTitle>{title}</CardTitle>}
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                        {actions && <div className="flex-shrink-0">{actions}</div>}
                    </div>
                </CardHeader>
            )}
            <CardContent className={cn(noPadding && 'p-0')}>
                {children}
            </CardContent>
        </Card>
    )
}
