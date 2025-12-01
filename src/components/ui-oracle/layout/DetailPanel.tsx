/**
 * DetailPanel - Slide-out Detail Panel
 * 
 * Oracle Fusion style slide-out panel for quick details:
 * - Slides in from right
 * - Overlay backdrop
 * - Header with close button
 * - Scrollable content
 * - Footer actions
 */

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DetailPanelProps {
    /** Whether panel is open */
    open: boolean

    /** Callback when panel should close */
    onClose: () => void

    /** Panel title */
    title: string

    /** Panel content */
    children: React.ReactNode

    /** Footer actions */
    footer?: React.ReactNode

    /** Panel width */
    width?: 'sm' | 'md' | 'lg' | 'xl'

    /** Additional CSS classes */
    className?: string
}

const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
}

export function DetailPanel({
    open,
    onClose,
    title,
    children,
    footer,
    width = 'md',
    className,
}: DetailPanelProps) {
    // Lock body scroll when panel is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [open, onClose])

    if (!open) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={cn(
                    'fixed right-0 top-0 bottom-0 z-50 w-full bg-white dark:bg-gray-900 shadow-2xl',
                    'animate-in slide-in-from-right duration-300',
                    widthClasses[width],
                    className
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="detail-panel-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2
                        id="detail-panel-title"
                        className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                        {title}
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close panel</span>
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        {footer}
                    </div>
                )}
            </div>
        </>
    )
}
