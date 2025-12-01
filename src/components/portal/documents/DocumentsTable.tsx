'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ContentSection, EmptyState, LoadingSkeleton, StatusMessage } from '@/components/ui-oracle'
import { FileText } from 'lucide-react'
import { DocumentNameCell } from './table/DocumentNameCell'
import { DocumentSizeCell } from './table/DocumentSizeCell'
import { DocumentDateCell } from './table/DocumentDateCell'
import { DocumentStatusCell } from './table/DocumentStatusCell'
import { DocumentActionsCell } from './table/DocumentActionsCell'
import type { Document } from '@/lib/documents'
import type { APIClientError } from '@/lib/api-client'

export interface DocumentsTableProps {
    documents: Document[]
    total: number
    loading: boolean
    error: APIClientError | null
    onStar: (id: string, starred: boolean) => void
    onDownload: (id: string, name: string) => void
    onUploadClick: () => void
}

export function DocumentsTable({
    documents,
    total,
    loading,
    error,
    onStar,
    onDownload,
    onUploadClick,
}: DocumentsTableProps) {
    if (error) {
        return (
            <StatusMessage variant="error" title="Failed to load documents">
                {error.message}
            </StatusMessage>
        )
    }

    if (loading) {
        return <LoadingSkeleton variant="table" count={5} />
    }

    if (documents.length === 0) {
        return (
            <ContentSection>
                <EmptyState
                    icon={FileText}
                    title="No documents found"
                    description="Upload your first document to get started"
                    action={{ label: 'Upload Document', onClick: onUploadClick }}
                />
            </ContentSection>
        )
    }

    return (
        <ContentSection title={`Documents (${total})`}>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell>
                                    <DocumentNameCell name={doc.name} contentType={doc.contentType} />
                                </TableCell>
                                <TableCell>
                                    <DocumentSizeCell size={doc.size} />
                                </TableCell>
                                <TableCell>
                                    <DocumentDateCell uploadedAt={doc.uploadedAt} />
                                </TableCell>
                                <TableCell>
                                    <DocumentStatusCell avStatus={doc.avStatus} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <DocumentActionsCell document={doc} onStar={onStar} onDownload={onDownload} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </ContentSection>
    )
}
