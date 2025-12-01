/**
 * KPIGrid - Responsive Grid for KPI Cards
 * 
 * Oracle Fusion style grid layout that adapts to screen size:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 4 columns
 * - Large: 6 columns
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface KPIGridProps {
    /** Child KPICard components */
    children: React.ReactNode

    /** Number of columns on desktop (default: 4) */
    columns?: 2 | 3 | 4 | 5 | 6

    /** Additional CSS classes */
    className?: string
}

const columnClasses = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
}

export function KPIGrid({ children, columns = 4, className }: KPIGridProps) {
    return (
        <div
            className={cn(
                'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
                columnClasses[columns],
                className
            )}
        >
            {children}
        </div>
    )
}
