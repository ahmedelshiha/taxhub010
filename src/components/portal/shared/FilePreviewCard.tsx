import React from 'react'
import { FileText, X, Check, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface FilePreviewCardProps {
    file: File
    onRemove: () => void
    uploadProgress?: number // 0-100
    error?: string
    success?: boolean
}

export function FilePreviewCard({
    file,
    onRemove,
    uploadProgress,
    error,
    success
}: FilePreviewCardProps) {
    const isImage = file.type.startsWith('image/')
    const [preview, setPreview] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (isImage) {
            const url = URL.createObjectURL(file)
            setPreview(url)
            return () => URL.revokeObjectURL(url)
        }
    }, [file, isImage])

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    return (
        <div className={cn(
            "relative flex items-center gap-4 p-3 rounded-lg border bg-white transition-all",
            error ? "border-red-200 bg-red-50" : "border-gray-200",
            success && "border-green-200 bg-green-50"
        )}>
            {/* Preview Icon/Image */}
            <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                {isImage && preview ? (
                    <img src={preview} alt={file.name} className="h-full w-full object-cover" />
                ) : (
                    file.type === 'application/pdf' ? (
                        <FileText className="h-6 w-6 text-red-500" />
                    ) : (
                        <FileText className="h-6 w-6 text-blue-500" />
                    )
                )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                        {file.name}
                    </p>
                    <button
                        onClick={onRemove}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                        disabled={success || (uploadProgress !== undefined && uploadProgress > 0 && uploadProgress < 100)}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatSize(file.size)}</span>
                    {error && <span className="text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Failed</span>}
                    {success && <span className="text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Uploaded</span>}
                </div>

                {/* Progress Bar */}
                {uploadProgress !== undefined && !error && !success && (
                    <div className="mt-2">
                        <Progress value={uploadProgress} className="h-1" />
                    </div>
                )}
            </div>
        </div>
    )
}
