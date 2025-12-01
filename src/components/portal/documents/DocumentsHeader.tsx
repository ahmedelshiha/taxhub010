'use client'

import { ActionHeader } from '@/components/ui-oracle'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'

export interface DocumentsHeaderProps {
    onUploadClick: () => void
}

export function DocumentsHeader({ onUploadClick }: DocumentsHeaderProps) {
    return (
        <ActionHeader
            title="Documents"
            description="Manage tax and compliance documents"
            primaryAction={
                <Button onClick={onUploadClick}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
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
