/**
 * PageLayout Component
 * Standard page layout wrapper with optional title and max-width control
 */

import { cn } from '@/lib/utils'

export interface PageLayoutProps {
    title?: string
    children: React.ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
    className?: string
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
}

export function PageLayout({ title, children, maxWidth = '7xl', className }: PageLayoutProps) {
    return (
        <div className={cn('mx-auto space-y-6', maxWidth && maxWidthClasses[maxWidth], className)}>
            {title && (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h1>
            )}
            {children}
        </div>
    )
}
