import { Button } from '@/components/ui/button'
import { Star, StarOff, Download } from 'lucide-react'
import { isDownloadable, type Document } from '@/lib/documents'

export interface DocumentActionsCellProps {
    document: Document
    onStar: (id: string, starred: boolean) => void
    onDownload: (id: string, name: string) => void
}

export function DocumentActionsCell({ document, onStar, onDownload }: DocumentActionsCellProps) {
    return (
        <div className="flex items-center justify-end gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onStar(document.id, document.starred || false)}
                title={document.starred ? 'Remove from favorites' : 'Add to favorites'}
            >
                {document.starred ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : (
                    <StarOff className="h-4 w-4" />
                )}
                <span className="sr-only">{document.starred ? 'Unstar' : 'Star'}</span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(document.id, document.name)}
                disabled={!isDownloadable(document)}
                title="Download"
            >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
            </Button>
        </div>
    )
}
