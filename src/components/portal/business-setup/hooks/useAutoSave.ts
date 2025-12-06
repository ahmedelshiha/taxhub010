/**
 * Auto-Save Hook for Business Setup
 * 
 * Automatically saves form data to localStorage with encryption.
 * Supports resume on return and 7-day expiry.
 */

import { useEffect, useCallback, useRef } from 'react'
import type { SetupFormData } from '../types/setup'

const STORAGE_KEY = 'business_setup_draft'
const SAVE_DELAY_MS = 3000 // Save 3 seconds after last change
const EXPIRY_DAYS = 7

interface StoredDraft {
    data: Partial<SetupFormData>
    savedAt: number
    version: string
}

/**
 * Simple encryption for localStorage (XOR with key)
 */
function encrypt(data: string): string {
    const key = process.env.NEXT_PUBLIC_ENCRYPT_KEY || 'default-key'
    try {
        const keyBytes = new TextEncoder().encode(key)
        const dataBytes = new TextEncoder().encode(data)
        const encrypted = new Uint8Array(dataBytes.length)

        for (let i = 0; i < dataBytes.length; i++) {
            encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length]
        }

        return btoa(String.fromCharCode(...encrypted))
    } catch {
        return btoa(data)
    }
}

/**
 * Decrypt from localStorage
 */
function decrypt(encrypted: string): string {
    const key = process.env.NEXT_PUBLIC_ENCRYPT_KEY || 'default-key'
    try {
        const keyBytes = new TextEncoder().encode(key)
        const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
        const decrypted = new Uint8Array(encryptedBytes.length)

        for (let i = 0; i < encryptedBytes.length; i++) {
            decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length]
        }

        return new TextDecoder().decode(decrypted)
    } catch {
        return ''
    }
}

/**
 * Check if draft is expired
 */
function isExpired(savedAt: number): boolean {
    const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000
    return Date.now() - savedAt > expiryTime
}

/**
 * Save draft to localStorage
 */
export function saveDraft(data: Partial<SetupFormData>): void {
    if (typeof window === 'undefined') return

    try {
        const draft: StoredDraft = {
            data,
            savedAt: Date.now(),
            version: '2.0',
        }

        const encrypted = encrypt(JSON.stringify(draft))
        localStorage.setItem(STORAGE_KEY, encrypted)
    } catch (error) {
        console.error('Failed to save draft:', error)
    }
}

/**
 * Load draft from localStorage
 */
export function loadDraft(): Partial<SetupFormData> | null {
    if (typeof window === 'undefined') return null

    try {
        const encrypted = localStorage.getItem(STORAGE_KEY)
        if (!encrypted) return null

        const decrypted = decrypt(encrypted)
        if (!decrypted) return null

        const draft: StoredDraft = JSON.parse(decrypted)

        // Check expiry
        if (isExpired(draft.savedAt)) {
            clearDraft()
            return null
        }

        // Check version compatibility
        if (draft.version !== '2.0') {
            clearDraft()
            return null
        }

        return draft.data
    } catch (error) {
        console.error('Failed to load draft:', error)
        clearDraft()
        return null
    }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Failed to clear draft:', error)
    }
}

/**
 * Check if a draft exists
 */
export function hasDraft(): boolean {
    if (typeof window === 'undefined') return false

    const draft = loadDraft()
    return draft !== null && Object.keys(draft).length > 0
}

/**
 * Get draft age in human-readable format
 */
export function getDraftAge(): string | null {
    if (typeof window === 'undefined') return null

    try {
        const encrypted = localStorage.getItem(STORAGE_KEY)
        if (!encrypted) return null

        const decrypted = decrypt(encrypted)
        if (!decrypted) return null

        const draft: StoredDraft = JSON.parse(decrypted)
        const ageMs = Date.now() - draft.savedAt
        const ageMinutes = Math.floor(ageMs / 60000)
        const ageHours = Math.floor(ageMs / 3600000)
        const ageDays = Math.floor(ageMs / 86400000)

        if (ageDays > 0) return `${ageDays} day${ageDays > 1 ? 's' : ''} ago`
        if (ageHours > 0) return `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`
        if (ageMinutes > 0) return `${ageMinutes} minute${ageMinutes > 1 ? 's' : ''} ago`
        return 'just now'
    } catch {
        return null
    }
}

/**
 * Auto-save hook
 */
export function useAutoSave(
    formData: Partial<SetupFormData>,
    enabled: boolean = true
): { isSaving: boolean; lastSaved: Date | null } {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedRef = useRef<Date | null>(null)
    const isSavingRef = useRef(false)

    const save = useCallback(() => {
        if (!enabled) return

        // Don't save if form is empty
        if (!formData.businessName && !formData.licenseNumber) {
            return
        }

        isSavingRef.current = true
        saveDraft(formData)
        lastSavedRef.current = new Date()
        isSavingRef.current = false
    }, [formData, enabled])

    useEffect(() => {
        if (!enabled) return

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Schedule new save
        timeoutRef.current = setTimeout(save, SAVE_DELAY_MS)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [formData, save, enabled])

    return {
        isSaving: isSavingRef.current,
        lastSaved: lastSavedRef.current,
    }
}

const autoSaveUtils = {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    getDraftAge,
    useAutoSave,
}

export default autoSaveUtils
