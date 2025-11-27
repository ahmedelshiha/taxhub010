'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatFileSize } from '@/lib/documents'

export interface UploadDocumentModalProps {
    open: boolean
    onClose: () => void
    onSubmit: (formData: FormData) => void
    isUploading: boolean
    categoryFilter?: string
}

export function UploadDocumentModal({
    open,
    onClose,
    onSubmit,
    isUploading,
    categoryFilter = 'other',
}: UploadDocumentModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [category, setCategory] = useState(categoryFilter)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleSubmit = () => {
        if (!selectedFile) {
            toast.error('Please select a file')
            return
        }

        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('category', category !== 'all' ? category : 'other')

        onSubmit(formData)
        setSelectedFile(null)
        setCategory('other')
    }

    const handleClose = () => {
        if (!isUploading) {
            setSelectedFile(null)
            setCategory('other')
            onClose()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>Select a file to upload to your document vault</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File</label>
                        <Input
                            type="file"
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            disabled={isUploading}
                        />
                        {selectedFile && (
                            <p className="text-sm text-gray-600 mt-2">
                                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                        <Select value={category} onValueChange={setCategory} disabled={isUploading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="invoice">Invoice</SelectItem>
                                <SelectItem value="receipt">Receipt</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="statement">Statement</SelectItem>
                                <SelectItem value="tax">Tax Document</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={!selectedFile || isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
