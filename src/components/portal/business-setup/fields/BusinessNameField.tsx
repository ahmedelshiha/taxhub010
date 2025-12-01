'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BusinessNameFieldProps {
    value?: string
    onChange: (value: string) => void
    error?: string
    disabled?: boolean
}

export default function BusinessNameField({ value, onChange, error, disabled }: BusinessNameFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
                id="businessName"
                placeholder="Enter your registered business name"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={error ? 'border-red-500' : ''}
                maxLength={100}
            />
            <div className="flex justify-between text-xs text-gray-500">
                <span>{error && <span className="text-red-500">{error}</span>}</span>
                <span>{value?.length || 0}/100</span>
            </div>
        </div>
    )
}
