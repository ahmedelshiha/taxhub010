/**
 * Modal Error Boundary
 * Catches and displays errors that occur within modal components
 * Provides graceful error handling with user-friendly UI
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
    children: ReactNode
    modalName?: string
    onReset?: () => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ModalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console
        console.error('Modal Error Boundary caught error:', error, errorInfo)

        // Log to error reporting service (e.g., Sentry)
        if (typeof window !== 'undefined' && (window as any).Sentry) {
            ; (window as any).Sentry.captureException(error, {
                contexts: {
                    errorBoundary: {
                        modalName: this.props.modalName,
                        componentStack: errorInfo.componentStack,
                    },
                },
            })
        }

        this.setState({
            error,
            errorInfo,
        })
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })

        // Call optional reset callback
        this.props.onReset?.()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-[400px] p-6">
                    <Card className="max-w-md w-full p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Something went wrong
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {this.props.modalName
                                        ? `There was an error loading ${this.props.modalName}. `
                                        : 'There was an unexpected error. '}
                                    Please try again.
                                </p>
                            </div>
                        </div>

                        {/* Show error details in development */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                                            Component Stack
                                        </summary>
                                        <pre className="text-xs text-gray-600 dark:text-gray-400 mt-2 overflow-auto max-h-32">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={this.handleReset}
                                className="flex-1"
                                variant="outline"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="default"
                            >
                                Reload Page
                            </Button>
                        </div>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

export default ModalErrorBoundary
