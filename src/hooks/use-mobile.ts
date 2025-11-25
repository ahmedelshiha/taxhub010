/**
 * Mobile optimization utilities
 * Touch gestures, viewport detection, and mobile-specific features
 */

import { useEffect, useState } from 'react'

/**
 * Detect if device is mobile
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return isMobile
}

/**
 * Swipe gesture detection
 */
export function useSwipeGesture(
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    threshold: number = 50
) {
    useEffect(() => {
        let touchStartX = 0
        let touchEndX = 0

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.changedTouches[0].screenX
        }

        const handleTouchEnd = (e: TouchEvent) => {
            touchEndX = e.changedTouches[0].screenX
            handleSwipe()
        }

        const handleSwipe = () => {
            const diff = touchStartX - touchEndX

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Swipe left
                    onSwipeLeft?.()
                } else {
                    // Swipe right
                    onSwipeRight?.()
                }
            }
        }

        document.addEventListener('touchstart', handleTouchStart)
        document.addEventListener('touchend', handleTouchEnd)

        return () => {
            document.removeEventListener('touchstart', handleTouchStart)
            document.removeEventListener('touchend', handleTouchEnd)
        }
    }, [onSwipeLeft, onSwipeRight, threshold])
}

/**
 * Pull-to-refresh functionality
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
    useEffect(() => {
        let touchStartY = 0
        let scrollElement: HTMLElement | null = null

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY
            scrollElement = e.target as HTMLElement
        }

        const handleTouchMove = async (e: TouchEvent) => {
            const touchY = e.touches[0].clientY
            const pullDistance = touchY - touchStartY

            // Check if at top of page and pulling down
            if (window.scrollY === 0 && pullDistance > 80) {
                e.preventDefault()
                await onRefresh()
            }
        }

        document.addEventListener('touchstart', handleTouchStart, { passive: true })
        document.addEventListener('touchmove', handleTouchMove, { passive: false })

        return () => {
            document.removeEventListener('touchstart', handleTouchStart)
            document.removeEventListener('touchmove', handleTouchMove)
        }
    }, [onRefresh])
}

/**
 * Check if touch target meets minimum size (44x44px WCAG)
 */
export function validateTouchTarget(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return rect.width >= 44 && rect.height >= 44
}

/**
 * Prevent body scroll (useful for modals on mobile)
 */
export function usePreventBodyScroll(isOpen: boolean) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            document.body.style.position = 'fixed'
            document.body.style.width = '100%'
        } else {
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.width = ''
        }

        return () => {
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.width = ''
        }
    }, [isOpen])
}

/**
 * Detect viewport orientation
 */
export function useOrientation() {
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

    useEffect(() => {
        const handleOrientationChange = () => {
            setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
        }

        handleOrientationChange()
        window.addEventListener('resize', handleOrientationChange)
        return () => window.removeEventListener('resize', handleOrientationChange)
    }, [])

    return orientation
}
