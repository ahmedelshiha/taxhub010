'use client'

import { useState, Suspense, useEffect, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X, Save, CheckCircle2 } from 'lucide-react'
import { CountryFlagSelector, type Country } from '../fields/CountryFlagSelector'
import { ExistingEntityTab } from '../tabs/ExistingEntityTab'
import { NewEntityTab } from '../tabs/NewEntityTab'
import { SetupErrorBoundary } from '../components/SetupErrorBoundary'
import { SetupModalSkeleton } from '../components/LoadingStates'
import { analytics } from '../services/analytics'
import { useAutoSave, loadDraft, clearDraft, hasDraft, getDraftAge } from '../hooks/useAutoSave'
import { SuccessScreen } from '@/components/portal/entities'
import type { SetupFormData } from '../types/setup'

export interface SetupModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onComplete?: (data: SetupFormData) => void | Promise<void>
}

type TabType = 'existing' | 'new'

/**
 * Simplified single-step business setup modal
 * Based on LEDGERS design - completes in ~30 seconds
 * 
 * Features:
 * - Country selector in header
 * - Tab-based entity type selection
 * - Searchable department dropdown
 * - Dark theme with mobile optimization
 * - Error boundary for graceful failures
 * - Analytics tracking
 * - Auto-save with draft resume
 */
export function SetupModal({ open, onOpenChange, onComplete }: SetupModalProps) {
    const [selectedCountry, setSelectedCountry] = useState<Country['code']>('AE')
    const [activeTab, setActiveTab] = useState<TabType>('existing')
    const [formData, setFormData] = useState<Partial<SetupFormData>>({
        country: 'AE',
        businessType: 'existing'
    })
    const [showDraftPrompt, setShowDraftPrompt] = useState(false)
    const [draftAge, setDraftAge] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [submittedBusinessName, setSubmittedBusinessName] = useState('')

    // Track when modal was opened for duration calculation
    const openTimeRef = useRef<number | null>(null)

    // Auto-save form data
    const { lastSaved } = useAutoSave(formData, open)
    const [showSaveIndicator, setShowSaveIndicator] = useState(false)

    // Show save indicator briefly after save
    useEffect(() => {
        if (lastSaved) {
            setShowSaveIndicator(true)
            const timeout = setTimeout(() => setShowSaveIndicator(false), 2000)
            return () => clearTimeout(timeout)
        }
    }, [lastSaved])

    // Check for draft when modal opens
    useEffect(() => {
        if (open && hasDraft()) {
            setDraftAge(getDraftAge())
            setShowDraftPrompt(true)
        }
    }, [open])

    // Track modal open/close
    useEffect(() => {
        if (open) {
            openTimeRef.current = Date.now()
            analytics.modalOpened('dashboard')
        }
    }, [open])

    const handleResumeDraft = () => {
        const draft = loadDraft()
        if (draft) {
            setFormData(draft)
            if (draft.country) setSelectedCountry(draft.country as Country['code'])
            if (draft.businessType) setActiveTab(draft.businessType as TabType)
        }
        setShowDraftPrompt(false)
    }

    const handleDiscardDraft = () => {
        clearDraft()
        setShowDraftPrompt(false)
    }

    const handleCountryChange = (country: Country['code']) => {
        setSelectedCountry(country)
        setFormData(prev => ({ ...prev, country }))
        analytics.countrySelected(country)
    }

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab)
        setFormData(prev => ({ ...prev, businessType: tab }))
        analytics.tabSwitched(tab)
    }

    const handleSubmit = async (data: SetupFormData) => {
        const duration = openTimeRef.current
            ? Math.round((Date.now() - openTimeRef.current) / 1000)
            : 0

        // Store business name for success screen
        setSubmittedBusinessName(data.businessName || 'Your Business')

        if (onComplete) {
            await onComplete(data)
        }

        // Clear draft on successful submission
        clearDraft()

        analytics.setupCompleted(data.businessType || 'new', data.country || 'AE', duration)

        // Show success screen instead of closing immediately
        setShowSuccess(true)
    }

    const handleGoToDashboard = () => {
        setShowSuccess(false)
        onOpenChange(false)
    }

    const handleAddAnother = () => {
        setShowSuccess(false)
        setFormData({ country: selectedCountry, businessType: activeTab })
    }

    const handleClose = () => {
        // Track abandonment if closed without completing
        if (openTimeRef.current) {
            const duration = Math.round((Date.now() - openTimeRef.current) / 1000)
            analytics.flowAbandoned(activeTab, duration)
        }
        onOpenChange(false)
    }

    // Success screen after submission
    if (showSuccess) {
        return (
            <Dialog open={open} onOpenChange={() => handleGoToDashboard()}>
                <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white p-0 overflow-hidden">
                    <SuccessScreen
                        businessName={submittedBusinessName}
                        onGoToDashboard={handleGoToDashboard}
                        onAddAnother={handleAddAnother}
                    />
                </DialogContent>
            </Dialog>
        )
    }

    // Draft resume prompt
    if (showDraftPrompt) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white p-6">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Save className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold">Resume Your Draft?</h3>
                        <p className="text-sm text-gray-400">
                            You have an unsaved draft from {draftAge}. Would you like to continue where you left off?
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleDiscardDraft}
                                className="flex-1 px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Start Fresh
                            </button>
                            <button
                                onClick={handleResumeDraft}
                                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Resume Draft
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
                    max-w-2xl w-[95vw] sm:w-full
                    p-0 gap-0
                    bg-gray-900 text-white
                    border border-gray-800
                    shadow-2xl
                    max-h-[90vh] sm:max-h-[85vh]
                    overflow-hidden
                    flex flex-col
                "
                onInteractOutside={(e) => e.preventDefault()}
            >
                <SetupErrorBoundary>
                    {/* Header with Country Selector */}
                    <div className="
                        flex items-center justify-between
                        px-4 sm:px-6 py-3 sm:py-4
                        border-b border-gray-800
                        flex-shrink-0
                    ">
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                            <h2 className="text-lg sm:text-xl font-semibold">
                                Business Setup
                            </h2>
                            <CountryFlagSelector
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                className="ml-0 sm:ml-2"
                            />
                        </div>

                        <button
                            onClick={handleClose}
                            className="
                                p-2 rounded-lg
                                hover:bg-gray-800
                                transition-colors
                                min-w-[44px] min-h-[44px]
                                flex items-center justify-center
                            "
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs - Mobile optimized with larger touch targets */}
                    <div className="
                        flex border-b border-gray-800
                        px-4 sm:px-6
                        flex-shrink-0
                    ">
                        <button
                            onClick={() => handleTabChange('existing')}
                            className={`
                                px-3 sm:px-4 py-3 sm:py-3 
                                font-medium text-sm
                                border-b-2 transition-colors
                                min-h-[44px]
                                ${activeTab === 'existing'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                }
                            `}
                        >
                            Existing Business
                        </button>
                        <button
                            onClick={() => handleTabChange('new')}
                            className={`
                                px-3 sm:px-4 py-3 sm:py-3 
                                font-medium text-sm
                                border-b-2 transition-colors
                                min-h-[44px]
                                ${activeTab === 'new'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                }
                            `}
                        >
                            New Business
                        </button>
                    </div>

                    {/* Tab Content - Scrollable on mobile */}
                    <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                        <Suspense fallback={<SetupModalSkeleton />}>
                            {activeTab === 'existing' ? (
                                <ExistingEntityTab
                                    country={selectedCountry}
                                    formData={formData}
                                    onFormDataChange={setFormData}
                                    onSubmit={handleSubmit}
                                />
                            ) : (
                                <NewEntityTab
                                    country={selectedCountry}
                                    formData={formData}
                                    onFormDataChange={setFormData}
                                    onSubmit={handleSubmit}
                                />
                            )}
                        </Suspense>
                    </div>
                </SetupErrorBoundary>
            </DialogContent>
        </Dialog>
    )
}
