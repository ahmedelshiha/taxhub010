import React from 'react'
import { WidgetContainer } from '../WidgetContainer'
import { ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ComplianceItem {
    id: string
    title: string
    dueDate: string
    progress: number
    priority: 'high' | 'medium' | 'low'
    status: string
}

interface ComplianceTrackerWidgetProps {
    items: ComplianceItem[]
    loading?: boolean
    error?: string
}

const priorityColors = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-green-600 dark:text-green-400',
}

export function ComplianceTrackerWidget({ items, loading, error }: ComplianceTrackerWidgetProps) {
    return (
        <WidgetContainer
            title="Compliance Tracker"
            icon={<ShieldCheck className="h-5 w-5" />}
            loading={loading}
            error={error}
            action={
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                    <Link href="/portal/compliance">
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            }
        >
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-full mb-3">
                        <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">All compliant!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No pending compliance actions.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.slice(0, 3).map((item) => (
                        <div key={item.id} className="space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                                    <p className={cn("text-xs font-medium flex items-center mt-0.5", priorityColors[item.priority])}>
                                        {item.priority === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                        Due {new Date(item.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="text-xs font-medium text-gray-500">{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-1.5" />
                        </div>
                    ))}
                </div>
            )}
        </WidgetContainer>
    )
}
