'use client'

import { useState } from 'react'
import {
    PageLayout, ActionHeader, ContentSection, DetailPanel,
    KPICard, KPIGrid, StatusBadge, TrendIndicator, EmptyState,
    SearchBox, FilterChip, FilterBar,
    LoadingSkeleton, StatusMessage
} from '@/components/ui-oracle'
import { Button } from '@/components/ui/button'
import { DollarSign, Users, FileText, Activity, Plus, Filter, X } from 'lucide-react'

export default function DemoPage() {
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [activeFilters, setActiveFilters] = useState(['Status: Active', 'Type: Invoice'])
    const [isLoading, setIsLoading] = useState(false)

    return (
        <PageLayout title="Oracle Fusion UI Demo" maxWidth="7xl">
            <ActionHeader
                title="Component Library"
                description="Showcase of all Oracle Fusion UI components"
                primaryAction={<Button>Primary Action</Button>}
                secondaryActions={<Button variant="outline">Secondary</Button>}
            />

            <div className="space-y-8">
                {/* KPI Section */}
                <section>
                    <h2 className="text-lg font-semibold mb-4">KPI Cards</h2>
                    <KPIGrid columns={4}>
                        <KPICard label="Total Revenue" value="$124,500" trend={12.5} icon={DollarSign} variant="success" />
                        <KPICard label="Active Users" value="1,234" trend={-2.4} icon={Users} variant="warning" />
                        <KPICard label="Pending Tasks" value="15" comparisonText="5 overdue" icon={FileText} variant="danger" />
                        <KPICard label="System Status" value="Operational" icon={Activity} variant="info" />
                    </KPIGrid>
                </section>

                {/* Feedback Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContentSection title="Status Messages">
                        <div className="space-y-2">
                            <StatusMessage variant="success" title="Success">Operation completed successfully.</StatusMessage>
                            <StatusMessage variant="warning" title="Warning">Your subscription expires soon.</StatusMessage>
                            <StatusMessage variant="error" title="Error">Failed to save changes.</StatusMessage>
                            <StatusMessage variant="info">System maintenance scheduled for tonight.</StatusMessage>
                        </div>
                    </ContentSection>

                    <ContentSection title="Loading States">
                        <div className="space-y-4">
                            <Button onClick={() => setIsLoading(!isLoading)} size="sm">Toggle Loading</Button>
                            {isLoading ? <LoadingSkeleton variant="card" /> : <div className="p-4 border rounded">Content Loaded</div>}
                            <LoadingSkeleton variant="list" count={2} />
                        </div>
                    </ContentSection>
                </section>

                {/* Filters Section */}
                <section>
                    <h2 className="text-lg font-semibold mb-4">Filters & Search</h2>
                    <ContentSection>
                        <div className="space-y-4">
                            <SearchBox onSearch={() => { }} placeholder="Search components..." />
                            <FilterBar
                                filters={activeFilters}
                                onRemoveFilter={(f) => setActiveFilters(activeFilters.filter(x => x !== f))}
                                onClearAll={() => setActiveFilters([])}
                            >
                                <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" /> Add Filter</Button>
                            </FilterBar>
                        </div>
                    </ContentSection>
                </section>

                {/* Data Display Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContentSection title="Status Badges">
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge variant="success">Success</StatusBadge>
                            <StatusBadge variant="warning">Warning</StatusBadge>
                            <StatusBadge variant="danger">Danger</StatusBadge>
                            <StatusBadge variant="info">Info</StatusBadge>
                            <StatusBadge variant="neutral">Neutral</StatusBadge>
                            <StatusBadge variant="brand">Brand</StatusBadge>
                        </div>
                    </ContentSection>

                    <ContentSection title="Empty State">
                        <EmptyState
                            icon={FileText}
                            title="No Documents"
                            description="Upload a document to get started"
                            action={{ label: 'Upload', onClick: () => { } }}
                        />
                    </ContentSection>
                </section>

                {/* Interactive Section */}
                <section>
                    <Button onClick={() => setIsDetailOpen(true)}>Open Detail Panel</Button>
                    <DetailPanel
                        isOpen={isDetailOpen}
                        onClose={() => setIsDetailOpen(false)}
                        title="Component Details"
                    >
                        <div className="p-6">
                            <h3 className="font-medium mb-2">Detail Content</h3>
                            <p className="text-gray-600">This panel slides out from the right.</p>
                        </div>
                    </DetailPanel>
                </section>
            </div>
        </PageLayout>
    )
}
