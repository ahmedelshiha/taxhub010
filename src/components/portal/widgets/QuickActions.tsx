'use client'

import { ContentSection } from '@/components/ui-oracle'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CreditCard, HelpCircle, Plus, type LucideIcon } from 'lucide-react'

export interface QuickAction {
    id: string
    label: string
    icon: LucideIcon
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary' | 'ghost'
}

export interface QuickActionsWidgetProps {
    actions?: QuickAction[]
}

export function QuickActionsWidget({ actions }: QuickActionsWidgetProps) {
    const defaultActions: QuickAction[] = [
        { id: 'upload', label: 'Upload Document', icon: Upload, onClick: () => { }, variant: 'outline' },
        { id: 'invoice', label: 'Create Invoice', icon: Plus, onClick: () => { }, variant: 'default' },
        { id: 'pay', label: 'Make Payment', icon: CreditCard, onClick: () => { }, variant: 'outline' },
        { id: 'help', label: 'Get Help', icon: HelpCircle, onClick: () => { }, variant: 'ghost' },
    ]

    const displayActions = actions || defaultActions

    return (
        <ContentSection title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
                {displayActions.map((action) => (
                    <Button
                        key={action.id}
                        variant={action.variant as any || 'outline'}
                        className="h-auto py-4 flex flex-col gap-2 items-center justify-center text-center"
                        onClick={action.onClick}
                    >
                        <action.icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                ))}
            </div>
        </ContentSection>
    )
}
