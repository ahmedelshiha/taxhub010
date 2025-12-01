import { getFileIcon } from '@/lib/documents'

export interface DocumentNameCellProps {
    name: string
    contentType: string
}

export function DocumentNameCell({ name, contentType }: DocumentNameCellProps) {
    const FileIcon = getFileIcon(contentType)

    return (
        <div className="flex items-center gap-3">
            <FileIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white truncate">{name}</p>
                <p className="text-xs text-gray-500 truncate">{contentType}</p>
            </div>
        </div>
    )
}
