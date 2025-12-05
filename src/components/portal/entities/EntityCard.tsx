'use client'

/**
 * Entity Card Component
 * Displays a single business entity with status badge
 */

import Link from 'next/link'
import { Building2, ChevronRight } from 'lucide-react'
import { StatusBadge, type EntityStatusType } from './StatusBadge'

const COUNTRY_FLAGS: Record<string, string> = {
    AE: '🇦🇪',
    SA: '🇸🇦',
    EG: '🇪🇬',
}

const COUNTRY_NAMES: Record<string, string> = {
    AE: 'UAE',
    SA: 'Saudi Arabia',
    EG: 'Egypt',
}

export interface EntityData {
    id: string
    name: string
    status: EntityStatusType | string
    country: string
    legalForm?: string
    createdAt?: string
}

interface EntityCardProps {
    entity: EntityData
    onClick?: () => void
}

export function EntityCard({ entity, onClick }: EntityCardProps) {
    const flag = COUNTRY_FLAGS[entity.country] || '🌍'
    const countryName = COUNTRY_NAMES[entity.country] || entity.country

    const content = (
        <div className="group flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
                {/* Entity Icon */}
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gray-400" />
                </div>

                {/* Entity Info */}
                <div>
                    <h3 className="font-medium text-white group-hover:text-teal-400 transition-colors">
                        {entity.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {flag} {countryName}
                        {entity.legalForm && ` • ${entity.legalForm}`}
                    </p>
                </div>
            </div>

            {/* Status Badge + Arrow */}
            <div className="flex items-center gap-3">
                <StatusBadge status={entity.status} size="sm" />
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
            </div>
        </div>
    )

    // If onClick provided, use button; otherwise use Link
    if (onClick) {
        return (
            <button onClick={onClick} className="w-full text-left">
                {content}
            </button>
        )
    }

    return (
        <Link href={`/portal/businesses/${entity.id}`}>
            {content}
        </Link>
    )
}

export default EntityCard
