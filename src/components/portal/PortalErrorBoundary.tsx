"use client"

import { ErrorBoundary } from '@/components/providers/error-boundary'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

function PortalErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                We encountered an unexpected error while loading this section of the portal.
                Our team has been notified.
            </p>
            <div className="flex gap-4">
                <Button onClick={resetError} variant="default">
                    Try Again
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Reload Page
                </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-w-2xl w-full overflow-auto max-h-64">
                    <p className="font-mono text-xs text-red-600 dark:text-red-400 mb-2">{error.message}</p>
                    <pre className="font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {error.stack}
                    </pre>
                </div>
            )}
        </div>
    )
}

export function PortalErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary fallback={PortalErrorFallback}>
            {children}
        </ErrorBoundary>
    )
}
