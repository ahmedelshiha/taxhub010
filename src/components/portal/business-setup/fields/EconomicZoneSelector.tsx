'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EconomicZoneSelectorProps {
    value?: string
    onChange: (value: string) => void
    country?: string
}

const ZONES: Record<string, string[]> = {
    'AE': ['Mainland', 'Dubai Multi Commodities Centre (DMCC)', 'Jebel Ali Free Zone (JAFZA)', 'Dubai Internet City', 'Abu Dhabi Global Market (ADGM)'],
    'SA': ['Mainland', 'Riyadh', 'Jeddah', 'Dammam'],
    'EG': ['Cairo', 'Alexandria', 'Giza']
}

export default function EconomicZoneSelector({ value, onChange, country }: EconomicZoneSelectorProps) {
    const options = country ? (ZONES[country] || []) : []

    return (
        <div className="space-y-2">
            <Label>Economic Zone / Jurisdiction</Label>
            <Select value={value || ''} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                            {zone}
                        </SelectItem>
                    ))}
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
