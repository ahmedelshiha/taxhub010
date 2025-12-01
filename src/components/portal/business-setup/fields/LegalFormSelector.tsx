'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface LegalFormSelectorProps {
    value?: string
    onChange: (value: string) => void
}

const FORMS = [
    'Limited Liability Company (LLC)',
    'Sole Proprietorship',
    'Civil Company',
    'Branch of Foreign Company',
    'Free Zone Company',
    'Freelancer'
]

export default function LegalFormSelector({ value, onChange }: LegalFormSelectorProps) {
    return (
        <div className="space-y-2">
            <Label>Legal Form</Label>
            <Select value={value || ''} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select legal structure" />
                </SelectTrigger>
                <SelectContent>
                    {FORMS.map((form) => (
                        <SelectItem key={form} value={form}>
                            {form}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
