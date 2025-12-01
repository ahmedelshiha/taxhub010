/**
 * Portal Footer Component
 * Optional footer with system info and help links
 */

'use client'

import Link from 'next/link'
import { HelpCircle, Mail, FileText } from 'lucide-react'

export default function PortalFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-4 px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                {/* Left: Copyright */}
                <div className="flex items-center gap-4">
                    <span>© {currentYear} TaxHub Portal</span>
                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                    <span className="hidden sm:inline">v1.0.0</span>
                </div>

                {/* Right: Links */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/portal/help"
                        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                        <HelpCircle className="h-4 w-4" />
                        <span>Help</span>
                    </Link>
                    <Link
                        href="/portal/messages"
                        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                        <Mail className="h-4 w-4" />
                        <span>Support</span>
                    </Link>
                    <Link
                        href="/portal/help"
                        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                        <FileText className="h-4 w-4" />
                        <span>Docs</span>
                    </Link>
                </div>
            </div>
        </footer>
    )
}
