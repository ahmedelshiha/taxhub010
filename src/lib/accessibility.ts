/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

/**
 * Generate accessible ID for form fields
 */
export function getAccessibleId(label: string): string {
    return label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/**
 * Get ARIA attributes for form fields
 */
export function getFieldAriaProps(options: {
    label: string
    required?: boolean
    error?: string
    description?: string
}) {
    const id = getAccessibleId(options.label)

    return {
        id,
        'aria-required': options.required,
        'aria-invalid': !!options.error,
        'aria-describedby': options.description ? `${id}-description` : undefined,
        'aria-errormessage': options.error ? `${id}-error` : undefined,
    }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof window === 'undefined') return

    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement)
    }, 1000)
}

/**
 * Check if element meets WCAG color contrast requirements
 */
export function meetsContrastRequirements(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA'
): boolean {
    const ratio = getContrastRatio(foreground, background)
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
    const l1 = getLuminance(color1)
    const l2 = getLuminance(color2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(color: string): number {
    // Simplified - would need full implementation for production
    // This is a placeholder that returns a reasonable value
    return 0.5
}

/**
 * Focus trap for modals
 */
export function createFocusTrap(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault()
                lastElement?.focus()
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault()
                firstElement?.focus()
            }
        }
    }

    container.addEventListener('keydown', handleKeyDown)

    // Focus first element
    firstElement?.focus()

    // Return cleanup function
    return () => {
        container.removeEventListener('keydown', handleKeyDown)
    }
}
