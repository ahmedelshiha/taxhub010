/**
 * Accessibility Utilities
 * Production-ready accessibility helpers for keyboard navigation, focus management, and ARIA
 */

/**
 * Focus Trap - Keeps focus within a container (useful for modals)
 */
export class FocusTrap {
    private container: HTMLElement
    private firstFocusable: HTMLElement | null = null
    private lastFocusable: HTMLElement | null = null
    private previouslyFocused: HTMLElement | null = null

    constructor(container: HTMLElement) {
        this.container = container
        this.updateFocusableElements()
    }

    /**
     * Get all focusable elements within container
     */
    private getFocusableElements(): HTMLElement[] {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(', ')

        return Array.from(this.container.querySelectorAll(selector)).filter(
            (el) => {
                // Filter out hidden elements
                const htmlEl = el as HTMLElement
                return (
                    htmlEl.offsetParent !== null &&
                    !htmlEl.hasAttribute('hidden') &&
                    htmlEl.getAttribute('aria-hidden') !== 'true'
                )
            }
        ) as HTMLElement[]
    }

    /**
     * Update focusable elements list
     */
    updateFocusableElements(): void {
        const elements = this.getFocusableElements()
        this.firstFocusable = elements[0] || null
        this.lastFocusable = elements[elements.length - 1] || null
    }

    /**
     * Activate the focus trap
     */
    activate(): void {
        this.previouslyFocused = document.activeElement as HTMLElement
        this.updateFocusableElements()
        this.firstFocusable?.focus()

        this.container.addEventListener('keydown', this.handleKeyDown)
    }

    /**
     * Deactivate the focus trap
     */
    deactivate(): void {
        this.container.removeEventListener('keydown', this.handleKeyDown)

        // Restore focus to previously focused element
        if (this.previouslyFocused && this.previouslyFocused.focus) {
            this.previouslyFocused.focus()
        }
    }

    /**
     * Handle Tab key navigation
     */
    private handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== 'Tab') return

        this.updateFocusableElements()

        if (event.shiftKey) {
            // Shift + Tab (backwards)
            if (
                document.activeElement === this.firstFocusable ||
                !this.container.contains(document.activeElement)
            ) {
                event.preventDefault()
                this.lastFocusable?.focus()
            }
        } else {
            // Tab (forwards)
            if (
                document.activeElement === this.lastFocusable ||
                !this.container.contains(document.activeElement)
            ) {
                event.preventDefault()
                this.firstFocusable?.focus()
            }
        }
    }
}

/**
 * Keyboard Navigation Helper
 * Handles arrow key navigation with wrapping
 */
export class KeyboardNavigator {
    private items: HTMLElement[]
    private currentIndex: number = -1
    private onSelect?: (index: number, element: HTMLElement) => void

    constructor(
        items: HTMLElement[],
        options?: {
            initialIndex?: number
            onSelect?: (index: number, element: HTMLElement) => void
            loop?: boolean
        }
    ) {
        this.items = items
        this.currentIndex = options?.initialIndex ?? -1
        this.onSelect = options?.onSelect
    }

    /**
     * Handle keyboard event
     */
    handleKeyDown(event: KeyboardEvent): boolean {
        switch (event.key) {
            case 'ArrowDown':
            case 'Down':
                event.preventDefault()
                this.next()
                return true

            case 'ArrowUp':
            case 'Up':
                event.preventDefault()
                this.previous()
                return true

            case 'Home':
                event.preventDefault()
                this.first()
                return true

            case 'End':
                event.preventDefault()
                this.last()
                return true

            case 'Enter':
            case ' ':
                event.preventDefault()
                if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
                    this.onSelect?.(this.currentIndex, this.items[this.currentIndex])
                }
                return true

            default:
                return false
        }
    }

    /**
     * Navigate to next item
     */
    next(): void {
        if (this.items.length === 0) return

        this.currentIndex = (this.currentIndex + 1) % this.items.length
        this.focusCurrent()
    }

    /**
     * Navigate to previous item
     */
    previous(): void {
        if (this.items.length === 0) return

        this.currentIndex =
            this.currentIndex <= 0 ? this.items.length - 1 : this.currentIndex - 1
        this.focusCurrent()
    }

    /**
     * Navigate to first item
     */
    first(): void {
        this.currentIndex = 0
        this.focusCurrent()
    }

    /**
     * Navigate to last item
     */
    last(): void {
        this.currentIndex = this.items.length - 1
        this.focusCurrent()
    }

    /**
     * Focus current item
     */
    private focusCurrent(): void {
        if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
            this.items[this.currentIndex].focus()
        }
    }
}

/**
 * Screen Reader Announcer
 * Announces messages to screen readers
 */
export class ScreenReaderAnnouncer {
    private static instance: ScreenReaderAnnouncer
    private liveRegion: HTMLElement | null = null

    private constructor() {
        this.createLiveRegion()
    }

    static getInstance(): ScreenReaderAnnouncer {
        if (!ScreenReaderAnnouncer.instance) {
            ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer()
        }
        return ScreenReaderAnnouncer.instance
    }

    /**
     * Create ARIA live region
     */
    private createLiveRegion(): void {
        if (typeof document === 'undefined') return

        this.liveRegion = document.createElement('div')
        this.liveRegion.setAttribute('role', 'status')
        this.liveRegion.setAttribute('aria-live', 'polite')
        this.liveRegion.setAttribute('aria-atomic', 'true')
        this.liveRegion.className = 'sr-only'
        this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `

        document.body.appendChild(this.liveRegion)
    }

    /**
     * Announce a message
     */
    announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
        if (!this.liveRegion) return

        this.liveRegion.setAttribute('aria-live', priority)

        // Clear and set new message
        this.liveRegion.textContent = ''

        // Small delay to ensure screen reader picks up the change
        setTimeout(() => {
            if (this.liveRegion) {
                this.liveRegion.textContent = message
            }
        }, 100)
    }

    /**
     * Clear announcement
     */
    clear(): void {
        if (this.liveRegion) {
            this.liveRegion.textContent = ''
        }
    }
}

/**
 * ARIA Label Generator
 * Generates accessible ARIA labels for common UI patterns
 */
export const ariaLabel = {
    /**
     * Pagination label
     */
    pagination: (current: number, total: number): string => {
        return `Page ${current} of ${total}`
    },

    /**
     * Progress label
     */
    progress: (current: number, max: number, unit = '%'): string => {
        return `Progress: ${current} of ${max}${unit}`
    },

    /**
     * Loading label
     */
    loading: (entity?: string): string => {
        return entity ? `Loading ${entity}...` : 'Loading...'
    },

    /**
     * Error label
     */
    error: (message: string): string => {
        return `Error: ${message}`
    },

    /**
     * Success label
     */
    success: (message: string): string => {
        return `Success: ${message}`
    },

    /**
     * Modal label
     */
    modal: (title: string): string => {
        return `${title} dialog`
    },

    /**
     * Button with action
     */
    button: (action: string, target?: string): string => {
        return target ? `${action} ${target}` : action
    },

    /**
     * Close button
     */
    close: (target?: string): string => {
        return target ? `Close ${target}` : 'Close'
    },

    /**
     * Toggle button
     */
    toggle: (state: boolean, label: string): string => {
        return `${state ? 'Hide' : 'Show'} ${label}`
    },

    /**
     * Sort button
     */
    sort: (column: string, direction?: 'asc' | 'desc'): string => {
        if (!direction) return `Sort by ${column}`
        return `Sorted by ${column}, ${direction === 'asc' ? 'ascending' : 'descending'}`
    },

    /**
     * Notification badge
     */
    notificationBadge: (count: number): string => {
        return count === 1
            ? '1 unread notification'
            : `${count} unread notifications`
    },
}

/**
 * React Hook: useFocusTrap
 */
export function useFocusTrap(
    containerRef: React.RefObject<HTMLElement>,
    active: boolean
): void {
    React.useEffect(() => {
        if (!containerRef.current || !active) return

        const trap = new FocusTrap(containerRef.current)
        trap.activate()

        return () => {
            trap.deactivate()
        }
    }, [containerRef, active])
}

/**
 * React Hook: useScreenReaderAnnounce
 */
export function useScreenReaderAnnounce(): (
    message: string,
    priority?: 'polite' | 'assertive'
) => void {
    const announcer = ScreenReaderAnnouncer.getInstance()

    return React.useCallback(
        (message: string, priority: 'polite' | 'assertive' = 'polite') => {
            announcer.announce(message, priority)
        },
        [announcer]
    )
}

/**
 * Export as default utility object
 */
export const a11y = {
    FocusTrap,
    KeyboardNavigator,
    ScreenReaderAnnouncer,
    ariaLabel,
    useFocusTrap,
    useScreenReaderAnnounce,
}

import React from 'react'

export default a11y
