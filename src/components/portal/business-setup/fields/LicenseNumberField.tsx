'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'

interface LicenseNumberFieldProps {
    value?: string
    onChange: (value: string) => void
    onLookup: () => void
    isLookingUp?: boolean
    error?: string
}

export default function LicenseNumberField({
    value,
    onChange,
    onLookup,
    isLookingUp,
    error
}: LicenseNumberFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="licenseNumber">Trade License Number</Label>
            <div className="flex gap-2">
                <Input
                    id="licenseNumber"
                    placeholder="e.g. CN-1234567"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={error ? 'border-red-500' : ''}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={onLookup}
                    disabled={!value || isLookingUp}
                >
                    {isLookingUp ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Lookup</span>
                </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}
