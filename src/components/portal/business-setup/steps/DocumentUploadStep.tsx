'use client'

import { useEffect } from 'react'
import { useSetupWizard } from '../core/SetupContext'
import { DocumentUploader } from '../fields'
import { SetupDocument } from '../types/setup'

export default function DocumentUploadStep() {
    const { formData, actions } = useSetupWizard()

    useEffect(() => {
        // Documents are optional for initial setup, but good to have
        if (formData.documents && formData.documents.length > 0) {
            actions.markStepComplete(5)
        }
    }, [formData.documents, actions])

    const handleUpload = (files: File[]) => {
        const newDocs: SetupDocument[] = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'complete', // Mock upload success
            progress: 100
        }))

        actions.updateFormData({
            documents: [...(formData.documents || []), ...newDocs]
        })
    }

    const handleRemove = (id: string) => {
        actions.updateFormData({
            documents: (formData.documents || []).filter(d => d.id !== id)
        })
    }

    return (
        <div className="space-y-6 py-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Please upload your trade license or registration documents if available.
                </p>
            </div>

            <DocumentUploader
                documents={formData.documents || []}
                onUpload={handleUpload}
                onRemove={handleRemove}
            />
        </div>
    )
}
