import { Loader2 } from 'lucide-react'

export default function PortalLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 animate-pulse">
                    Loading portal...
                </p>
            </div>
        </div>
    )
}
