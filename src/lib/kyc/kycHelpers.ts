import { CheckCircle2, Circle, type LucideIcon } from 'lucide-react'

/**
 * Get step icon based on status
 */
export function getStepIcon(status: string): LucideIcon {
    switch (status) {
        case 'completed':
            return CheckCircle2
        case 'in_progress':
            return Circle
        case 'pending':
        default:
            return Circle
    }
}

/**
 * Get step status color classes
 */
export function getStepStatusColor(status: string): string {
    switch (status) {
        case 'completed':
            return 'text-green-600 dark:text-green-400'
        case 'in_progress':
            return 'text-blue-600 dark:text-blue-400'
        case 'pending':
        default:
            return 'text-gray-400 dark:text-gray-600'
    }
}

/**
 * Get card background color based on status
 */
export function getCardBackgroundColor(status: string): string {
    switch (status) {
        case 'completed':
            return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        case 'in_progress':
            return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        case 'pending':
        default:
            return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
}

/**
 * Get badge variant based on overall status
 */
export function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' {
    switch (status) {
        case 'complete':
            return 'default'
        case 'in_progress':
            return 'secondary'
        case 'not_started':
        default:
            return 'outline'
    }
}

/**
 * Get status display text
 */
export function getStatusText(status: string): string {
    switch (status) {
        case 'complete':
            return 'Complete'
        case 'in_progress':
            return 'In Progress'
        case 'not_started':
        default:
            return 'Not Started'
    }
}
