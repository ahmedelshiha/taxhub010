/**
 * PageLayout - Standard Oracle Fusion Page Container
 * 
 * Provides consistent page structure with:
 * - Responsive padding
 * - Max-width container
 * - Optional background
 * - Proper spacing
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface PageLayoutProps {
    /** Page content */
    children: React.ReactNode

    /** Page title (for accessibility) */
    title?: string

    /** Maximum width */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'

    /** Whether to add padding */
    noPadding?: boolean

    /** Background variant */
    background?: 'default' | 'transparent' | 'white' | 'gray'

    /** Additional CSS classes */
    className?: string
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
}

const backgroundClasses = {
    default: 'bg-gray-50 dark:bg-gray-900',
    transparent: 'bg-transparent',
    white: 'bg-white dark:bg-gray-950',
    gray: 'bg-gray-100 dark:bg-gray-800',
}

export function PageLayout({
    children,
    title,
    maxWidth = '7xl',
    noPadding = false,
    background = 'transparent',
    className,
}: PageLayoutProps) {
    return (
        <div
            className={cn(
                'min-h-full',
                backgroundClasses[background],
                className
            )}
            role="main"
            aria-label={title}
        >
            <div
                className={cn(
                    'mx-auto',
                    maxWidthClasses[maxWidth],
                    !noPadding && 'px-4 sm:px-6 lg:px-8 py-6'
                )}
            >
                {children}
            </div>
        </div>
    )
}
