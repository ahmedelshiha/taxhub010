import React from 'react'
import { cn } from '@/lib/utils'

interface WidgetGridProps {
    children: React.ReactNode
    className?: string
}

export function WidgetGrid({ children, className }: WidgetGridProps) {
    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            className
        )}>
            {children}
        </div>
    )
}
