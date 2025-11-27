'use client'

import { ActionHeader } from '@/components/ui-oracle'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

export interface InvoicingHeaderProps {
    onCreateClick: () => void
}

export function InvoicingHeader({ onCreateClick }: InvoicingHeaderProps) {
    return (
        <ActionHeader
            title="Invoicing"
            description="Create and manage invoices"
            primaryAction={
                <Button onClick={onCreateClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                </Button>
            }
            secondaryActions={
                <Link href="/portal">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
            }
        />
    )
}
