'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface TermsCheckboxProps {
    checked?: boolean
    onChange: (checked: boolean) => void
    error?: string
}

export default function TermsCheckbox({ checked, onChange, error }: TermsCheckboxProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                <Checkbox
                    id="terms"
                    checked={checked}
                    onCheckedChange={(c) => onChange(c as boolean)}
                    className="mt-1"
                />
                <div className="space-y-1">
                    <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I accept the Terms and Conditions
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        By checking this box, I confirm that the information provided is accurate and I agree to the{' '}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                        </Link>.
                    </p>
                </div>
            </div>
            {error && <p className="text-sm text-red-500 ml-1">{error}</p>}
        </div>
    )
}
