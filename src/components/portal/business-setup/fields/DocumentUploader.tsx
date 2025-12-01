'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { SetupDocument } from '../types/setup'

interface DocumentUploaderProps {
    documents: SetupDocument[]
    onUpload: (files: File[]) => void
    onRemove: (id: string) => void
}

export default function DocumentUploader({ documents, onUpload, onRemove }: DocumentUploaderProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        onUpload(acceptedFiles)
    }, [onUpload])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxSize: 5 * 1024 * 1024 // 5MB
    })

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragActive 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                        : "border-gray-300 hover:border-gray-400 dark:border-gray-700"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">
                        {isDragActive ? "Drop files here" : "Click or drag files to upload"}
                    </p>
                    <p className="text-xs text-gray-500">
                        PDF, JPG, PNG up to 5MB
                    </p>
                </div>
            </div>

            {documents.length > 0 && (
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <div 
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border rounded-lg shadow-sm"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{doc.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(doc.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {doc.status === 'uploading' && (
                                    <div className="w-24">
                                        <Progress value={doc.progress} className="h-2" />
                                    </div>
                                )}
                                {doc.status === 'complete' && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {doc.status === 'error' && (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onRemove(doc.id)
                                    }}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
