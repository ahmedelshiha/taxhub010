'use client'

import { useRouter } from 'next/navigation'
import { useEffect, use } from 'react'
import { Loader2 } from 'lucide-react'

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)

    useEffect(() => {
        // Redirect to invoicing page with the invoice ID as a query param or hash
        // Since individual invoice pages aren't implemented, redirect to main page
        router.push(`/portal/invoicing#${id}`)
    }, [id, router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Redirecting to invoicing...</p>
            </div>
        </div>
    )
}
