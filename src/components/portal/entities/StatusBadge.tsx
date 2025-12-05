'use client'

/**
 * Status Badge Component
 * Displays entity status with LEDGERS-style colored badges
 */

import { cn } from '@/lib/utils'

export type EntityStatusType =
    | 'PENDING_APPROVAL'
    | 'PENDING'
    | 'ACTIVE'
    | 'VERIFIED'
    | 'REJECTED'
    | 'REQUIRES_CHANGES'
    | 'SUSPENDED'

interface StatusConfig {
    label: string
    bgColor: string
    textColor: string
    borderColor: string
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    PENDING_APPROVAL: {
        label: 'Under Verification',
        bgColor: 'bg-teal-500/20',
        textColor: 'text-teal-400',
        borderColor: 'border-teal-500/30',
    },
    PENDING: {
        label: 'Under Verification',
        bgColor: 'bg-teal-500/20',
        textColor: 'text-teal-400',
        borderColor: 'border-teal-500/30',
    },
    ACTIVE: {
        label: 'Active',
        bgColor: 'bg-green-500/20',
        textColor: 'text-green-400',
        borderColor: 'border-green-500/30',
    },
    VERIFIED: {
        label: 'Verified',
        bgColor: 'bg-green-500/20',
        textColor: 'text-green-400',
        borderColor: 'border-green-500/30',
    },
    REJECTED: {
        label: 'Rejected',
        bgColor: 'bg-red-500/20',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/30',
    },
    REQUIRES_CHANGES: {
        label: 'Needs Update',
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/30',
    },
    SUSPENDED: {
        label: 'Suspended',
        bgColor: 'bg-gray-500/20',
        textColor: 'text-gray-400',
        borderColor: 'border-gray-500/30',
    },
}

interface StatusBadgeProps {
    status: EntityStatusType | string
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full font-medium border',
                config.bgColor,
                config.textColor,
                config.borderColor,
                sizeClasses[size],
                className
            )}
        >
            {config.label}
        </span>
    )
}

export default StatusBadge
