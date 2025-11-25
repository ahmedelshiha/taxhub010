"use client"

import React, { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onReset?: () => void
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ModalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Modal Error Boundary caught error:', error, errorInfo)

        // Log to error tracking service (e.g., Sentry)
        if (typeof window !== 'undefined' && (window as any).Sentry) {
            (window as any).Sentry.captureException(error, {
                contexts: {
                    react: {
                        componentStack: errorInfo.componentStack,
                    },
                },
            })
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
        this.props.onReset?.()
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-3 mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                        We encountered an unexpected error. Please try again or contact support if the problem persists.
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="text-left mb-4 w-full max-w-md">
                            <summary className="text-xs text-gray-500 cursor-pointer mb-2">
                                Error details (dev only)
                            </summary>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
                                {this.state.error.toString()}
                                {'\n\n'}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                    <div className="flex gap-2">
                        <Button onClick={this.handleReset} variant="outline">
                            Try Again
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
