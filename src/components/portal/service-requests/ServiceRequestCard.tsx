'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'
import { getStatusBadgeColor, getPriorityBadgeColor, type ServiceRequest } from '@/lib/service-requests'
import { useTranslations } from '@/lib/i18n'

export interface ServiceRequestCardProps {
    serviceRequest: ServiceRequest
}

export function ServiceRequestCard({ serviceRequest }: ServiceRequestCardProps) {
    const { t } = useTranslations()

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="py-4">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">{serviceRequest.title}</h3>
                            <Badge className={getPriorityBadgeColor(serviceRequest.priority)}>
                                {t(`priority.${serviceRequest.priority.toLowerCase()}`)}
                            </Badge>
                            <Badge className={getStatusBadgeColor(serviceRequest.status)}>
                                {serviceRequest.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">{serviceRequest.service?.name}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild aria-label={t('portal.serviceRequests.view')}>
                        <Link href={`/portal/service-requests/${serviceRequest.id}`}>
                            {t('portal.serviceRequests.view')} <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
