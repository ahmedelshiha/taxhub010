/**
 * Help Tooltip Component
 * Consistent tooltips for contextual help throughout the UI
 */

'use client'

import { HelpCircle } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface HelpTooltipProps {
    content: string
    className?: string
    side?: 'top' | 'right' | 'bottom' | 'left'
}

export default function HelpTooltip({ content, className, side = 'top' }: HelpTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            'inline-flex items-center justify-center',
                            'text-muted-foreground hover:text-foreground',
                            'transition-colors',
                            className
                        )}
                        aria-label="Help"
                    >
                        <HelpCircle className="h-4 w-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side={side} className="max-w-[300px]">
                    <p className="text-sm">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
