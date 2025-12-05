'use client'

/**
 * Success Screen Component
 * Shown in modal after successful business submission
 */

import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'

interface SuccessScreenProps {
    businessName: string
    onGoToDashboard: () => void
    onAddAnother?: () => void
}

export function SuccessScreen({
    businessName,
    onGoToDashboard,
    onAddAnother
}: SuccessScreenProps) {
    return (
        <div className="flex flex-col items-center text-center py-8 px-4 space-y-6">
            {/* Success Icon with Animation */}
            <div className="relative">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-scale-in">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                {/* Celebration particles */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping delay-100" />
                    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-200" />
                </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                    Business Submitted Successfully!
                </h2>
                <p className="text-lg text-gray-300">
                    &ldquo;{businessName}&rdquo;
                </p>
            </div>

            {/* Status Card */}
            <div className="w-full max-w-sm bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Status</span>
                    <StatusBadge status="PENDING_APPROVAL" size="sm" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Estimated Review</span>
                    <span className="text-sm text-gray-200">24-48 hours</span>
                </div>
            </div>

            {/* Next Steps */}
            <div className="w-full max-w-sm text-left space-y-2">
                <h3 className="text-sm font-medium text-gray-300">What happens next:</h3>
                <ul className="space-y-1.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                        <span className="text-teal-400 mt-0.5">•</span>
                        <span>Our team will verify your details</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-teal-400 mt-0.5">•</span>
                        <span>You&apos;ll receive an email when approved</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-teal-400 mt-0.5">•</span>
                        <span>Once approved, you can access all tax services</span>
                    </li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                {onAddAnother && (
                    <Button
                        variant="outline"
                        onClick={onAddAnother}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                        Add Another
                    </Button>
                )}
                <Button
                    onClick={onGoToDashboard}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                    Go to Dashboard
                </Button>
            </div>
        </div>
    )
}

export default SuccessScreen
