/**
 * Onboarding Welcome Modal
 * Shows on first-time user login
 */

'use client'

import { useState } from 'react'
import { Rocket, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface WelcomeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onStartTour: () => void
}

export default function WelcomeModal({ open, onOpenChange, onStartTour }: WelcomeModalProps) {
    const [dontShowAgain, setDontShowAgain] = useState(false)

    const handleClose = () => {
        if (dontShowAgain && typeof window !== 'undefined') {
            // Store preference in localStorage (SSR-safe)
            localStorage.setItem('portal-tour-dismissed', 'true')
        }
        onOpenChange(false)
    }

    const handleStartTour = () => {
        onStartTour()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Rocket className="h-6 w-6 text-primary" />
                        Welcome to Your Portal!
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        We&apos;ve redesigned the portal dashboard to give you a better experience.
                        Would you like a quick tour of the new features?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm">What&apos;s New:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary">✓</span>
                                <span>Redesigned sidebar navigation for easier access</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">✓</span>
                                <span>Tab-based dashboard with real-time data</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">✓</span>
                                <span>Global search (press Cmd/Ctrl+K)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">✓</span>
                                <span>Entity switcher for multi-entity users</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">✓</span>
                                <span>Export functionality for reports</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="dontShowAgain"
                            checked={dontShowAgain}
                            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                        />
                        <label
                            htmlFor="dontShowAgain"
                            className="text-sm text-muted-foreground cursor-pointer"
                        >
                            Don&apos;t show this again
                        </label>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={handleStartTour} className="flex-1">
                        Start Tour
                    </Button>
                    <Button onClick={handleClose} variant="outline" className="flex-1">
                        Skip for Now
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
