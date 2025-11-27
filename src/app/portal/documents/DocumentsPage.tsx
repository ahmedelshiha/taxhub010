'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageLayout } from '@/components/ui-oracle'
import { useDocuments } from '@/hooks/useDocuments'
import { DocumentsHeader } from '@/components/portal/documents/DocumentsHeader'
import { DocumentsFilters } from '@/components/portal/documents/DocumentsFilters'
import { DocumentsTable } from '@/components/portal/documents/DocumentsTable'
import { UploadDocumentModal } from '@/components/portal/documents/modals/UploadDocumentModal'

export default function DocumentsPage() {
  const searchParams = useSearchParams()
  const entityId = searchParams.get('entityId') || undefined

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const {
    documents,
    total,
    isLoading,
    error,
    uploadDocument,
    isUploading,
    starDocument,
    downloadDocument,
  } = useDocuments({ searchQuery, categoryFilter, entityId })

  const handleUpload = (formData: FormData) => {
    if (entityId) {
      formData.append('entityId', entityId)
    }
    uploadDocument(formData)
    setUploadModalOpen(false)
  }

  return (
    <PageLayout title="Documents" maxWidth="7xl">
      <div className="space-y-6">
        <DocumentsHeader onUploadClick={() => setUploadModalOpen(true)} />

        <DocumentsFilters
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          onSearchChange={setSearchQuery}
          onCategoryChange={setCategoryFilter}
        />

        <DocumentsTable
          documents={documents}
          total={total}
          loading={isLoading}
          error={error as any}
          onStar={starDocument}
          onDownload={downloadDocument}
          onUploadClick={() => setUploadModalOpen(true)}
        />

        <UploadDocumentModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSubmit={handleUpload}
          isUploading={isUploading}
          categoryFilter={categoryFilter}
        />
      </div>
    </PageLayout>
  )
}
