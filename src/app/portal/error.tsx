'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function PortalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error with full details
        console.error('[Portal Error Boundary]', {
            message: error.message,
            digest: error.digest,
            stack: error.stack,
            error
        })
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Something went wrong
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        We encountered an unexpected error while loading the portal.
                        {error.digest && (
                            <span className="block mt-2 text-xs font-mono text-gray-500">
                                Error ID: {error.digest}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                    >
                        Reload Page
                    </Button>
                    <Button onClick={() => reset()}>
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    )
}
