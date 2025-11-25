"use client"

import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load modal components for better performance
export const ApprovalActionModal = lazy(() =>
    import('@/components/portal/modals/ApprovalActionModal').then((mod) => ({
        default: mod.ApprovalActionModal,
    }))
)

export const MessageComposeModal = lazy(() =>
    import('@/components/portal/modals/MessageComposeModal').then((mod) => ({
        default: mod.MessageComposeModal,
    }))
)

export const MessageThreadModal = lazy(() =>
    import('@/components/portal/modals/MessageThreadModal').then((mod) => ({
        default: mod.MessageThreadModal,
    }))
)

// Modal loading fallback
export function ModalLoadingFallback() {
    return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    )
}

// Wrapper component for lazy-loaded modals with Suspense
interface LazyModalWrapperProps {
    children: React.ReactNode
}

export function LazyModalWrapper({ children }: LazyModalWrapperProps) {
    return <Suspense fallback={<ModalLoadingFallback />}>{children}</Suspense>
}
