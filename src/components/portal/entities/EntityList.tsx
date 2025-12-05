'use client'

/**
 * Entity List Component
 * Displays user's business entities with status badges
 * Similar to LEDGERS "Entities" section
 */

import { Plus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EntityCard, type EntityData } from './EntityCard'
import { Skeleton } from '@/components/ui/skeleton'

interface EntityListProps {
    entities: EntityData[]
    isLoading?: boolean
    onAddBusiness?: () => void
    title?: string
}

export function EntityList({
    entities,
    isLoading,
    onAddBusiness,
    title = 'Your Businesses'
}: EntityListProps) {
    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                </div>
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-lg bg-gray-700" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32 bg-gray-700" />
                                    <Skeleton className="h-3 w-24 bg-gray-700" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-28 rounded-full bg-gray-700" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Empty state
    if (entities.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-800/30 border border-gray-700/50 rounded-lg text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                        No businesses yet
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm">
                        Add your first business to start managing taxes, compliance, and more.
                    </p>
                    {onAddBusiness && (
                        <Button onClick={onAddBusiness} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Your First Business
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    // Entity list
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                    {title}
                    <span className="ml-2 text-sm font-normal text-gray-400">
                        ({entities.length})
                    </span>
                </h2>
                {onAddBusiness && (
                    <Button onClick={onAddBusiness} size="sm" variant="outline" className="gap-1.5">
                        <Plus className="w-4 h-4" />
                        Add
                    </Button>
                )}
            </div>
            <div className="space-y-2">
                {entities.map((entity) => (
                    <EntityCard key={entity.id} entity={entity} />
                ))}
            </div>
        </div>
    )
}

export default EntityList
