'use client'

import { ActionHeader } from '@/components/ui-oracle'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function KYCHeader() {
    return (
        <ActionHeader
            title="KYC Center"
            description="Complete your Know Your Customer verification"
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
