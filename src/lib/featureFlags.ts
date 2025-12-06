/**
 * Feature Flags for Business Setup
 * 
 * The new simplified business setup is now permanently enabled.
 * These functions are kept for backwards compatibility but always return true.
 */

/**
 * New business setup is always enabled
 * @returns always true - new setup is the default
 */
export function isNewBusinessSetupEnabled(): boolean {
    return true
}

/**
 * New business setup is enabled for all users
 * @returns always true - new setup is the default
 */
export function isNewBusinessSetupEnabledForUser(_userId: string): boolean {
    return true
}

/**
 * Feature flags configuration (for reference/monitoring)
 */
export const FEATURE_FLAGS = {
    // New business setup is permanently enabled
    NEW_BUSINESS_SETUP: 'ENABLED',
    // Audit logging
    AUDIT_LOGGING: 'NEXT_PUBLIC_ENABLE_AUDIT_LOGGING',
    // Rate limiting
    RATE_LIMITING: 'NEXT_PUBLIC_ENABLE_RATE_LIMITING',
} as const

/**
 * Get feature flag states (for debugging/monitoring)
 */
export function getFeatureFlagStates(): Record<string, boolean | string> {
    return {
        newBusinessSetup: true, // Always enabled
        auditLogging: process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING !== 'false',
        rateLimiting: process.env.NEXT_PUBLIC_ENABLE_RATE_LIMITING !== 'false',
    }
}

const featureFlagsUtils = {
    isNewBusinessSetupEnabled,
    isNewBusinessSetupEnabledForUser,
    getFeatureFlagStates,
    FEATURE_FLAGS,
}

export default featureFlagsUtils
