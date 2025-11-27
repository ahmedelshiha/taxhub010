/**
 * EmptyState - Oracle Fusion Style Empty State
 * 
 * Shows when no data is available with:
 * - Icon or illustration
 * - Title and description
 * - Optional call-to-action button
 * - Multiple visual variants
 */

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  /** Display icon */
  icon?: LucideIcon
  
  /** Title text */
  title: string
  
  /** Description text */
  description?: string
  
  /** Primary action */
  action?: {
    label: string
    onClick: () => void
  }
  
  /** Secondary action */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  
  /** Visual variant */
  variant?: 'default' | 'compact'
  
  /** Additional CSS classes */
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isCompact ? 'py-8' : 'py-12 px-4',
        className
      )}
    >
      {/* Icon */}
      {Icon && (
        <div
          className={cn(
            'rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4',
            isCompact ? 'h-12 w-12' : 'h-16 w-16'
          )}
        >
          <Icon
            className={cn(
              'text-gray-400 dark:text-gray-500',
              isCompact ? 'h-6 w-6' : 'h-8 w-8'
            )}
          />
        </div>
      )}

      {/* Title */}
      <h3
        className={cn(
          'font-semibold text-gray-900 dark:text-white',
          isCompact ? 'text-base mb-1' : 'text-lg mb-2'
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'text-gray-600 dark:text-gray-400 max-w-sm',
            isCompact ? 'text-sm mb-3' : 'text-base mb-6'
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button onClick={action.onClick} size={isCompact ? 'sm' : 'default'}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size={isCompact ? 'sm' : 'default'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
