'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function SubmissionStatusStep() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [entityId, setEntityId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Simulate processing time if not passed via props
        // In real app, this state would come from the mutation result
        const timer = setTimeout(() => {
            setStatus('success')
            // Mock ID for successful submission simulation
            setEntityId(`ent_${Date.now()}`)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                <h3 className="text-xl font-semibold">Processing Application...</h3>
                <p className="text-gray-500">Please wait while we set up your account.</p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <XCircle className="w-16 h-16 text-red-500" />
                <h3 className="text-xl font-semibold">Something went wrong</h3>
                <p className="text-gray-500">We couldn&apos;t process your application. Please try again.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Setup Complete!</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Your business has been successfully registered on TaxHub.
                    You can now access your dashboard.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border text-center min-w-[300px]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Entity ID</p>
                <p className="font-mono font-medium text-lg">{entityId}</p>
            </div>

            <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push(`/portal/setup/status/${entityId}`)}
            >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
    )
}
