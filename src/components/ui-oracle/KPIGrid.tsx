/**
 * KPIGrid Component - Responsive Grid for KPI Cards
 * Supports 2, 3, 4, or 6 columns with responsive breakpoints
 */

import { cn } from '@/lib/utils'

export interface KPIGridProps {
    columns?: 2 | 3 | 4 | 6
    children: React.ReactNode
    className?: string
}

const gridColumns = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
}

export function KPIGrid({ columns = 4, children, className }: KPIGridProps) {
    return (
        <div className={cn('grid gap-4 md:gap-6', gridColumns[columns], className)}>
            {children}
        </div>
    )
}
