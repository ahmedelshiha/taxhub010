/**
 * Screen Reader Testing Utilities
 * Helpers for WCAG 2.1 AA compliance and screen reader testing
 */

/**
 * Check if screen reader is active
 */
export function isScreenReaderActive(): boolean {
    if (typeof window === 'undefined') return false

    // Check for common screen reader indicators
    return !!(
        (window as any).JAWS ||
        (window as any).NVDA ||
        (window as any).VoiceOver ||
        (window as any).TalkBack
    )
}

/**
 * Screen reader announcement queue
 */
class ScreenReaderAnnouncer {
    private liveRegion: HTMLElement | null = null

    constructor() {
        if (typeof document !== 'undefined') {
            this.initializeLiveRegion()
        }
    }

    private initializeLiveRegion() {
        // Create ARIA live region for announcements
        this.liveRegion = document.createElement('div')
        this.liveRegion.setAttribute('role', 'status')
        this.liveRegion.setAttribute('aria-live', 'polite')
        this.liveRegion.setAttribute('aria-atomic', 'true')
        this.liveRegion.className = 'sr-only'
        this.liveRegion.style.position = 'absolute'
        this.liveRegion.style.left = '-10000px'
        this.liveRegion.style.width = '1px'
        this.liveRegion.style.height = '1px'
        this.liveRegion.style.overflow = 'hidden'
        document.body.appendChild(this.liveRegion)
    }

    /**
     * Announce message to screen readers
     */
    announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
        if (!this.liveRegion) return

        // Update aria-live setting
        this.liveRegion.setAttribute('aria-live', priority)

        // Clear previous message
        this.liveRegion.textContent = ''

        // Announce new message after a brief delay
        setTimeout(() => {
            if (this.liveRegion) {
                this.liveRegion.textContent = message
            }
        }, 100)
    }

    /**
     * Announce form errors
     */
    announceError(fieldName: string, errorMessage: string) {
        this.announce(`Error in ${fieldName}: ${errorMessage}`, 'assertive')
    }

    /**
     * Announce success messages
     */
    announceSuccess(message: string) {
        this.announce(`Success: ${message}`, 'polite')
    }

    /**
     * Announce loading state
     */
    announceLoading(action: string) {
        this.announce(`Loading ${action}...`, 'polite')
    }

    /**
     * Announce completion
     */
    announceComplete(action: string) {
        this.announce(`${action} complete`, 'polite')
    }
}

export const screenReaderAnnouncer = new ScreenReaderAnnouncer()

/**
 * Get ARIA label for interactive elements
 */
export function getAriaLabel(element: {
    label?: string
    action?: string
    context?: string
}): string {
    const parts = []

    if (element.label) parts.push(element.label)
    if (element.action) parts.push(element.action)
    if (element.context) parts.push(element.context)

    return parts.join(', ')
}

/**
 * Screen reader testing checklist
 */
export const screenReaderChecklist = {
    navigation: [
        'All interactive elements have accessible names',
        'Heading hierarchy is logical (h1 -> h2 -> h3)',
        'Landmarks are properly labeled (main, nav, aside)',
        'Skip links are present for main content',
        'Focus order follows visual order',
    ],
    forms: [
        'All form fields have associated labels',
        'Required fields are marked with aria-required',
        'Error messages are announced',
        'Success messages are announced',
        'Field constraints are communicated',
    ],
    modals: [
        'Modal opening is announced',
        'Focus moves to modal on open',
        'Focus trap prevents escape',
        'Esc key closes modal',
        'Focus returns to trigger on close',
    ],
    dynamicContent: [
        'Live regions are used for updates',
        'Loading states are announced',
        'Errors are announced assertively',
        'Success is announced politely',
    ],
    multimedia: [
        'Images have alt text',
        'Decorative images have empty alt',
        'Icons have aria-label',
        'Videos have captions',
    ],
}

/**
 * Test if element is accessible to screen readers
 */
export function isAccessibleToScreenReaders(element: HTMLElement): boolean {
    // Check if element is hidden
    if (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true') {
        return false
    }

    // Check if element or parent is display: none or visibility: hidden
    const styles = window.getComputedStyle(element)
    if (styles.display === 'none' || styles.visibility === 'hidden') {
        return false
    }

    // Check if element has accessible name
    const hasAccessibleName = !!(
        element.getAttribute('aria-label') ||
        element.getAttribute('aria-labelledby') ||
        element.textContent?.trim()
    )

    return hasAccessibleName
}

/**
 * Generate accessibility report for element
 */
export interface AccessibilityIssue {
    severity: 'error' | 'warning' | 'info'
    message: string
    element: string
}

export function auditElement(element: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check for accessible name
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
        const hasName = !!(
            element.getAttribute('aria-label') ||
            element.getAttribute('aria-labelledby') ||
            element.textContent?.trim()
        )

        if (!hasName) {
            issues.push({
                severity: 'error',
                message: `${element.tagName} missing accessible name`,
                element: element.outerHTML.substring(0, 100),
            })
        }
    }

    // Check for form labels
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
        const hasLabel = !!(
            element.getAttribute('aria-label') ||
            element.getAttribute('aria-labelledby') ||
            document.querySelector(`label[for="${element.id}"]`)
        )

        if (!hasLabel) {
            issues.push({
                severity: 'error',
                message: 'Form field missing label',
                element: element.outerHTML.substring(0, 100),
            })
        }
    }

    // Check for image alt text
    if (element.tagName === 'IMG') {
        if (!element.hasAttribute('alt')) {
            issues.push({
                severity: 'error',
                message: 'Image missing alt attribute',
                element: element.outerHTML.substring(0, 100),
            })
        }
    }

    return issues
}
