/**
 * Internationalization (i18n) for Business Setup
 * 
 * Provides multi-language support with Arabic (RTL) and English (LTR).
 * Uses a simple approach without external dependencies.
 */

'use client'

import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react'

// Import translations
import enTranslations from '@/locales/en/business-setup.json'
import arTranslations from '@/locales/ar/business-setup.json'

export type Language = 'en' | 'ar'
export type Direction = 'ltr' | 'rtl'

interface Translations {
    [key: string]: string | Translations
}

const translations: Record<Language, Translations> = {
    en: enTranslations,
    ar: arTranslations,
}

interface I18nContextValue {
    language: Language
    direction: Direction
    isRTL: boolean
    setLanguage: (lang: Language) => void
    t: (key: string, params?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

/**
 * Get nested translation value by dot-notation key
 */
function getNestedValue(obj: Translations, path: string): string {
    const keys = path.split('.')
    let current: Translations | string = obj

    for (const key of keys) {
        if (typeof current === 'string') return path
        if (current[key] === undefined) return path
        current = current[key]
    }

    return typeof current === 'string' ? current : path
}

/**
 * Replace template parameters {param} with values
 */
function interpolate(text: string, params?: Record<string, string>): string {
    if (!params) return text

    return Object.entries(params).reduce(
        (str, [key, value]) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), value),
        text
    )
}

interface I18nProviderProps {
    children: ReactNode
    defaultLanguage?: Language
}

/**
 * I18n Provider Component
 */
export function I18nProvider({ children, defaultLanguage = 'en' }: I18nProviderProps) {
    const [language, setLanguageState] = useState<Language>(defaultLanguage)

    // Load saved language preference
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('business_setup_language') as Language
            if (saved && (saved === 'en' || saved === 'ar')) {
                setLanguageState(saved)
            }
        }
    }, [])

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang)
        if (typeof window !== 'undefined') {
            localStorage.setItem('business_setup_language', lang)
        }
    }, [])

    const direction: Direction = language === 'ar' ? 'rtl' : 'ltr'
    const isRTL = language === 'ar'

    const t = useCallback((key: string, params?: Record<string, string>): string => {
        const translation = getNestedValue(translations[language], key)
        return interpolate(translation, params)
    }, [language])

    const value = useMemo(() => ({
        language,
        direction,
        isRTL,
        setLanguage,
        t,
    }), [language, direction, isRTL, setLanguage, t])

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    )
}

/**
 * Hook to access i18n context
 */
export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext)

    if (!context) {
        // Return default values if not wrapped in provider
        return {
            language: 'en',
            direction: 'ltr',
            isRTL: false,
            setLanguage: () => { },
            t: (key: string) => key,
        }
    }

    return context
}

/**
 * Hook to get the current text direction
 */
export function useDirection(): Direction {
    const { direction } = useI18n()
    return direction
}

/**
 * Hook to check if current language is RTL
 */
export function useIsRTL(): boolean {
    const { isRTL } = useI18n()
    return isRTL
}

/**
 * Language switcher component styles helper
 */
export function getLanguageStyles(isRTL: boolean) {
    return {
        textAlign: isRTL ? 'right' as const : 'left' as const,
        direction: isRTL ? 'rtl' as const : 'ltr' as const,
    }
}

/**
 * Get RTL-aware flex direction
 */
export function getRTLFlexDirection(isRTL: boolean, reverse: boolean = false) {
    if (reverse) {
        return isRTL ? 'row' : 'row-reverse'
    }
    return isRTL ? 'row-reverse' : 'row'
}

const i18nUtils = {
    I18nProvider,
    useI18n,
    useDirection,
    useIsRTL,
}

export default i18nUtils
