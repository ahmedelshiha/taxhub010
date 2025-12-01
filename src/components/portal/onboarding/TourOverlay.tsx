/**
 * Tour Overlay Component  
 * Highlights specific elements during the tour
 */

'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TourOverlayProps {
    target?: string // CSS selector
    onTargetClick?: () => void
}

export default function TourOverlay({ target, onTargetClick }: TourOverlayProps) {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

    useEffect(() => {
        if (!target) {
            setTargetRect(null)
            return
        }

        const element = document.querySelector(target)
        if (element) {
            const rect = element.getBoundingClientRect()
            setTargetRect(rect)

            // Scroll element into view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [target])

    return (
        <>
            {/* Dark overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-[90] transition-opacity"
                onClick={onTargetClick}
            />

            {/* Highlight cutout */}
            {targetRect && (
                <>
                    <div
                        className="fixed z-[95] pointer-events-none"
                        style={{
                            top: targetRect.top - 8,
                            left: targetRect.left - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                            borderRadius: '8px',
                            border: '2px solid white',
                        }}
                    />
                    <div
                        className="fixed z-[96] bg-white/10 pointer-events-none animate-pulse"
                        style={{
                            top: targetRect.top - 8,
                            left: targetRect.left - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                            borderRadius: '8px',
                        }}
                    />
                </>
            )}
        </>
    )
}
