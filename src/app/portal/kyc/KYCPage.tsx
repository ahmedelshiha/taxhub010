'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageLayout, LoadingSkeleton, StatusMessage } from '@/components/ui-oracle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKYC } from '@/hooks/useKYC'
import { KYCHeader } from '@/components/portal/kyc/KYCHeader'
import { KYCProgressCard } from '@/components/portal/kyc/KYCProgressCard'
import { KYCStepsList } from '@/components/portal/kyc/KYCStepsList'
import { KYCTimeline } from '@/components/portal/kyc/KYCTimeline'

export default function KYCPage() {
    const searchParams = useSearchParams()
    const entityId = searchParams.get('entityId') || undefined
    const [activeTab, setActiveTab] = useState('overview')

    const { steps, progress, completedCount, totalSteps, overallStatus, isLoading, error } =
        useKYC(entityId)

    if (error) {
        return (
            <PageLayout title="KYC Center" maxWidth="7xl">
                <StatusMessage variant="error" title="Failed to load KYC data">
                    {error.message}
                </StatusMessage>
            </PageLayout>
        )
    }

    if (isLoading) {
        return (
            <PageLayout title="KYC Center" maxWidth="7xl">
                <LoadingSkeleton variant="card" count={3} />
            </PageLayout>
        )
    }

    return (
        <PageLayout title="KYC Center" maxWidth="7xl">
            <div className="space-y-6">
                <KYCHeader />

                <KYCProgressCard
                    progress={progress}
                    completedCount={completedCount}
                    totalSteps={totalSteps}
                    overallStatus={overallStatus}
                />

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-6">
                        <KYCStepsList steps={steps} entityId={entityId} />
                    </TabsContent>

                    <TabsContent value="timeline" className="mt-6">
                        <KYCTimeline steps={steps} />
                    </TabsContent>
                </Tabs>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Need help? Our compliance team is here to assist you through each verification step.{' '}
                        <Button variant="link" className="p-0 h-auto font-semibold">
                            Contact Support
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        </PageLayout>
    )
}
