'use client'

import { Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CountryOption {
    code: string
    name: string
    flag: string
    popular?: boolean
}

const COUNTRIES: CountryOption[] = [
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', popular: true },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', popular: true },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
    { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
    { code: 'OM', name: 'Oman', flag: '🇴🇲' },
    { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
]

interface CountrySelectorProps {
    value?: string
    onChange: (value: string) => void
    error?: string
}

export default function CountrySelector({ value, onChange, error }: CountrySelectorProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {COUNTRIES.map((country) => (
                    <Card
                        key={country.code}
                        className={cn(
                            "relative cursor-pointer transition-all hover:shadow-md",
                            value === country.code
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "hover:border-blue-200"
                        )}
                        onClick={() => onChange(country.code)}
                    >
                        <div className="p-4 flex items-center gap-3">
                            <span className="text-2xl">{country.flag}</span>
                            <span className="font-medium">{country.name}</span>
                            {value === country.code && (
                                <div className="absolute top-2 right-2 text-blue-500">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                            {country.popular && (
                                <span className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full border border-yellow-200">
                                    Popular
                                </span>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    )
}
