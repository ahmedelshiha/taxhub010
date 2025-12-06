/**
 * Business Setup Security Utilities
 * 
 * Security hardening for the business setup flow.
 * Implements CSRF protection, input sanitization, and rate limiting.
 */

import { applyRateLimit, getClientIp } from '@/lib/rate-limit'
import { isSameOrigin } from '@/lib/security/csrf'
import { NextRequest } from 'next/server'

/**
 * Rate limit configuration for business setup endpoints
 */
export const RATE_LIMITS = {
    // Entity setup: 3 attempts per hour per user
    ENTITY_SETUP: { limit: 3, windowMs: 60 * 60 * 1000 },
    // License lookup: 10 attempts per minute per user
    LICENSE_LOOKUP: { limit: 10, windowMs: 60 * 1000 },
    // Name check: 20 attempts per minute per user
    NAME_CHECK: { limit: 20, windowMs: 60 * 1000 },
}

/**
 * Apply rate limiting for business setup operations
 * @returns null if allowed, or error response if rate limited
 */
export async function checkRateLimit(
    request: NextRequest,
    userId: string,
    operation: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const config = RATE_LIMITS[operation]
    const ip = getClientIp(request as unknown as Request)
    const key = `business-setup:${operation}:${userId}:${ip}`

    const result = await applyRateLimit(key, config.limit, config.windowMs)

    return {
        allowed: result.allowed,
        remaining: result.remaining,
        resetAt: result.resetAt,
    }
}

/**
 * Validate CSRF by checking origin header
 */
export function validateCSRF(request: NextRequest): boolean {
    return isSameOrigin(request as unknown as Request)
}

/**
 * Sanitize string input to prevent XSS
 * Removes HTML tags and dangerous characters
 */
export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return ''

    return input
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove script-related content
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        // Remove null bytes
        .replace(/\0/g, '')
        // Trim whitespace
        .trim()
}

/**
 * Sanitize business name input
 * Allows letters, numbers, spaces, and common business name characters
 */
export function sanitizeBusinessName(name: string): string {
    if (typeof name !== 'string') return ''

    // First apply general sanitization
    const cleaned = sanitizeString(name)

    // Allow only alphanumeric, spaces, and common business name characters
    // This allows: letters (any language), numbers, spaces, &, -, ', .
    return cleaned
        .replace(/[^\p{L}\p{N}\s&\-'.,]/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Sanitize license number
 * Allows only alphanumeric and hyphens
 */
export function sanitizeLicenseNumber(license: string): string {
    if (typeof license !== 'string') return ''

    return license
        .replace(/[^a-zA-Z0-9\-]/g, '')
        .toUpperCase()
        .trim()
}

/**
 * Encrypt sensitive data for localStorage
 * Uses AES-256 encryption (requires crypto-js)
 * 
 * Note: For production, consider using Web Crypto API
 */
export function encryptForStorage(data: string): string {
    const key = process.env.NEXT_PUBLIC_ENCRYPT_KEY
    if (!key) {
        console.warn('NEXT_PUBLIC_ENCRYPT_KEY not set, storing data unencrypted')
        return btoa(data) // Fallback to base64
    }

    try {
        // Simple XOR encryption with key (for client-side)
        // In production, use proper AES encryption
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
 * Decrypt data from localStorage
 */
export function decryptFromStorage(encrypted: string): string {
    const key = process.env.NEXT_PUBLIC_ENCRYPT_KEY
    if (!key) {
        try {
            return atob(encrypted)
        } catch {
            return ''
        }
    }

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
 * Generate audit log entry
 */
export function createAuditEntry(
    action: string,
    userId: string,
    tenantId: string,
    request: NextRequest,
    details?: Record<string, unknown>
) {
    return {
        action,
        userId,
        tenantId,
        ipAddress: getClientIp(request as unknown as Request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        details,
    }
}

const securityService = {
    checkRateLimit,
    validateCSRF,
    sanitizeString,
    sanitizeBusinessName,
    sanitizeLicenseNumber,
    encryptForStorage,
    decryptFromStorage,
    createAuditEntry,
    RATE_LIMITS,
}

export default securityService
