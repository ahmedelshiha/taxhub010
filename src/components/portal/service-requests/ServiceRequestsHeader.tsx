'use client'

import { ActionHeader } from '@/components/ui-oracle'
import { Button } from '@/components/ui/button'
import { Plus, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from '@/lib/i18n'

export interface ServiceRequestsHeaderProps {
    onExport: () => void
    queuedCount?: number
    onProcessQueue?: () => void
}

export function ServiceRequestsHeader({ onExport, queuedCount, onProcessQueue }: ServiceRequestsHeaderProps) {
    const { t } = useTranslations()

    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('portal.serviceRequests.title')}</h1>
                    <p className="text-gray-600">{t('portal.serviceRequests.subtitle')}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onExport} aria-label={t('common.export')}>
                    {t('common.export')}
                </Button>
                <Button asChild aria-label={t('portal.serviceRequests.create')}>
                    <Link href="/portal/service-requests/new">
                        <Plus className="h-4 w-4 mr-2" /> {t('portal.serviceRequests.create')}
                    </Link>
                </Button>
            </div>
        </div>
    )
}
