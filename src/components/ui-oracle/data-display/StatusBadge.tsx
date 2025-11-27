/**
 * StatusBadge - Consistent Status Indicator
 * 
 * Oracle Fusion style status badge with:
 * - Predefined color schemes
 * - Multiple sizes
 * - Optional dot indicator
 * - Consistent typography
 */

import React from 'react'
import { cn } from '@/lib/utils'

export type StatusVariant = 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'neutral'
  | 'pending'

export type BadgeSize = 'sm' | 'md' | 'lg'

export interface StatusBadgeProps {
  /** Status variant determines color */
  variant: StatusVariant
  
  /** Badge text */
  children: React.ReactNode
  
  /** Size variant */
  size?: BadgeSize
  
  /** Show dot indicator */
  showDot?: boolean
  
  /** Additional CSS classes */
  className?: string
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-green-500 dark:bg-green-400',
  warning: 'bg-yellow-500 dark:bg-yellow-400',
  danger: 'bg-red-500 dark:bg-red-400',
  info: 'bg-blue-500 dark:bg-blue-400',
  neutral: 'bg-gray-500 dark:bg-gray-400',
  pending: 'bg-orange-500 dark:bg-orange-400',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

const dotSizeStyles: Record<BadgeSize, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
}

export function StatusBadge({
  variant,
  children,
  size = 'md',
  showDot = false,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full',
            dotStyles[variant],
            dotSizeStyles[size]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
