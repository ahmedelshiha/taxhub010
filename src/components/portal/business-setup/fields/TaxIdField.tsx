'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TaxIdFieldProps {
    value?: string
    onChange: (value: string) => void
    label?: string
}

export default function TaxIdField({ value, onChange, label = 'Tax Registration Number (TRN)' }: TaxIdFieldProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and dashes
        const val = e.target.value.replace(/[^\d-]/g, '')
        onChange(val)
    }

    return (
        <div className="space-y-2">
            <Label htmlFor="taxId">{label}</Label>
            <Input
                id="taxId"
                placeholder="e.g. 100-1234-5678"
                value={value || ''}
                onChange={handleChange}
            />
            <p className="text-xs text-gray-500">Optional for initial setup</p>
        </div>
    )
}
