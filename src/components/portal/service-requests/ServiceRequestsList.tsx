'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList } from 'lucide-react'
import { EmptyState, LoadingSkeleton } from '@/components/ui-oracle'
import { ServiceRequestCard } from './ServiceRequestCard'
import type { ServiceRequest } from '@/lib/service-requests'
import { useTranslations } from '@/lib/i18n'

export interface ServiceRequestsListProps {
    serviceRequests: ServiceRequest[]
    isLoading: boolean
}

export function ServiceRequestsList({ serviceRequests, isLoading }: ServiceRequestsListProps) {
    const { t } = useTranslations()

    if (isLoading) {
        return <LoadingSkeleton variant="card" count={3} />
    }

    if (!serviceRequests.length) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <EmptyState
                        icon={ClipboardList}
                        title={t('portal.serviceRequests.noRequests')}
                        description={t('portal.serviceRequests.createHelp')}
                        action={{
                            label: t('portal.serviceRequests.create'),
                            onClick: () => { }, // Will be handled by Link
                        }}
                    />
                    <Button asChild aria-label={t('portal.serviceRequests.create')} className="mt-4">
                        <Link href="/portal/service-requests/new">{t('portal.serviceRequests.create')}</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            {serviceRequests.map((sr) => (
                <ServiceRequestCard key={sr.id} serviceRequest={sr} />
            ))}
        </div>
    )
}
