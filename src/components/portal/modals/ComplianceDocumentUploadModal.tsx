/**
 * ComplianceDocumentUploadModal Component
 * 
 * Specialized modal for uploading compliance and regulatory documents
 * 
 * Features:
 * - Compliance document type selector
 * - Due date display with urgency indicators
 * - Compliance-specific validation rules
 * - Submission receipt generation
 * - Regulatory requirements checklist
 * - Audit trail metadata
 * - Integration with DropZone for drag-drop upload
 */

"use client";

import React, { useState } from "react";
import { FormModal } from "./FormModal";
import { DropZone } from "@/components/portal/shared/DropZone";
import { FilePreviewCard } from "@/components/portal/shared/FilePreviewCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    Shield,
    Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/shared/formatters";
import { cn } from "@/lib/utils";

export interface ComplianceDocumentUploadModalProps {
    open: boolean;
    onClose: () => void;
    complianceType?: string;
    dueDate?: Date;
    requirementId?: string;
    onSuccess?: () => void;
}

// Compliance document types
const COMPLIANCE_TYPES = [
    { value: "tax_return", label: "Tax Return", required: ["Financial statements", "Tax computation"] },
    { value: "vat_filing", label: "VAT Filing", required: ["VAT return", "Supporting invoices"] },
    { value: "audit_report", label: "Audit Report", required: ["Audited financials", "Audit opinion"] },
    { value: "license_renewal", label: "License Renewal", required: ["Application form", "Fee payment proof"] },
    { value: "regulatory_filing", label: "Regulatory Filing", required: ["Compliance form", "Supporting documents"] },
    { value: "financial_statement", label: "Financial Statement", required: ["Balance sheet", "Income statement"] },
    { value: "zakat_filing", label: "Zakat Filing", required: ["Zakat calculation", "Supporting docs"] },
    { value: "other", label: "Other Compliance", required: [] },
];

/**
 * ComplianceDocumentUploadModal Component
 */
export function ComplianceDocumentUploadModal({
    open,
    onClose,
    complianceType,
    dueDate,
    requirementId,
    onSuccess,
}: ComplianceDocumentUploadModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [selectedType, setSelectedType] = useState(complianceType || "");
    const [notes, setNotes] = useState("");
    const [acknowledgedRequirements, setAcknowledgedRequirements] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate urgency
    const getUrgencyLevel = (): "high" | "medium" | "low" | null => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue < 0) return "high"; // Overdue
        if (daysUntilDue <= 3) return "high";
        if (daysUntilDue <= 7) return "medium";
        return "low";
    };

    const urgency = getUrgencyLevel();
    const isOverdue = dueDate && new Date(dueDate) < new Date();
    const selectedTypeData = COMPLIANCE_TYPES.find(t => t.value === selectedType);

    const handleFilesAccepted = (newFiles: File[]) => {
        setFiles(prev => {
            const combined = [...prev, ...newFiles];
            // Deduplicate by name
            const unique = combined.filter((file, index, self) =>
                index === self.findIndex(f => f.name === file.name)
            );
            return unique.slice(0, 10); // Max 10 files for compliance
        });
    };

    const handleRemoveFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.name !== fileName));
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            toast.error("Please upload at least one document");
            return;
        }

        if (!selectedType) {
            toast.error("Please select a compliance document type");
            return;
        }

        if (selectedTypeData && selectedTypeData.required.length > 0 && !acknowledgedRequirements) {
            toast.error("Please acknowledge the required documents");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append("files", file);
            });
            formData.append("complianceType", selectedType);
            formData.append("notes", notes);
            if (requirementId) {
                formData.append("requirementId", requirementId);
            }

            const response = await apiFetch("/api/compliance/documents", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || "Failed to upload compliance documents");
            }

            const result = await response.json();

            toast.success(
                <div>
                    <div className="font-semibold">Documents uploaded successfully</div>
                    {result.data?.receiptId && (
                        <div className="text-xs mt-1">Receipt: {result.data.receiptId}</div>
                    )}
                </div>
            );

            // Reset form
            setFiles([]);
            setNotes("");
            setSelectedType(complianceType || "");
            setAcknowledgedRequirements(false);

            onSuccess?.();
            onClose();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload documents";
            toast.error(message);
            console.error("Compliance upload error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    return (
        <FormModal
            open={open}
            onClose={handleClose}
            title={
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>Upload Compliance Documents</span>
                </div>
            }
            description="Upload required documents for regulatory compliance"
            size="lg"
            submitLabel={isSubmitting ? "Uploading..." : "Submit Documents"}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isValid={files.length > 0 && !!selectedType}
        >
            <div className="space-y-6">
                {/* Due Date Alert */}
                {dueDate && (
                    <Alert
                        variant={isOverdue ? "destructive" : urgency === "high" ? "destructive" : "default"}
                        className={cn(
                            !isOverdue && urgency === "medium" && "border-orange-500 bg-orange-50 text-orange-900",
                            !isOverdue && urgency === "low" && "border-green-500 bg-green-50 text-green-900"
                        )}
                    >
                        <Calendar className="h-4 w-4" />
                        <AlertDescription>
                            <div className="flex items-center justify-between">
                                <span>
                                    {isOverdue ? "Overdue" : "Due"}: {formatDate(dueDate.toString())}
                                </span>
                                {urgency && (
                                    <Badge
                                        variant={urgency === "high" ? "destructive" : "secondary"}
                                        className={cn(
                                            urgency === "medium" && "bg-orange-500 text-white",
                                            urgency === "low" && "bg-green-500 text-white"
                                        )}
                                    >
                                        {urgency === "high" && <AlertCircle className="h-3 w-3 mr-1" />}
                                        {urgency === "medium" && <Clock className="h-3 w-3 mr-1" />}
                                        {urgency === "low" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                        {urgency.toUpperCase()} PRIORITY
                                    </Badge>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Document Type Selector */}
                <div className="space-y-2">
                    <Label htmlFor="compliance-type">
                        Compliance Document Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedType} onValueChange={setSelectedType} disabled={!!complianceType}>
                        <SelectTrigger id="compliance-type">
                            <SelectValue placeholder="Select document type..." />
                        </SelectTrigger>
                        <SelectContent>
                            {COMPLIANCE_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Required Documents Checklist */}
                {selectedTypeData && selectedTypeData.required.length > 0 && (
                    <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-2">
                                <p className="font-medium">Required documents for {selectedTypeData.label}:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {selectedTypeData.required.map((req, idx) => (
                                        <li key={idx}>{req}</li>
                                    ))}
                                </ul>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                    <Checkbox
                                        id="acknowledge"
                                        checked={acknowledgedRequirements}
                                        onCheckedChange={(checked) => setAcknowledgedRequirements(!!checked)}
                                    />
                                    <Label htmlFor="acknowledge" className="text-sm cursor-pointer">
                                        I confirm that I&apos;m uploading all required documents
                                    </Label>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* File Upload Zone */}
                <div className="space-y-3">
                    <Label>
                        Upload Documents <span className="text-red-500">*</span>
                    </Label>
                    <DropZone
                        onFilesAccepted={handleFilesAccepted}
                        accept={{
                            'image/*': ['.png', '.jpg', '.jpeg'],
                            'application/pdf': ['.pdf'],
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                            'application/vnd.ms-excel': ['.xls'],
                        }}
                        maxFiles={10 - files.length}
                        maxSize={20 * 1024 * 1024} // 20MB for compliance docs
                        disabled={isSubmitting || files.length >= 10}
                    />
                    <p className="text-xs text-gray-500">
                        Accepted: PDF, Images, Excel. Max 10 files, 20MB each
                    </p>
                </div>

                {/* File Preview List */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        <Label>Uploaded Files ({files.length}/10)</Label>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                            {files.map(file => (
                                <FilePreviewCard
                                    key={file.name}
                                    file={file}
                                    onRemove={() => handleRemoveFile(file.name)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Notes */}
                <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                        id="notes"
                        placeholder="Add any relevant notes about these documents..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={3}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Submission Info */}
                <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        <p className="font-medium mb-1">Secure Compliance Upload</p>
                        <ul className="space-y-1">
                            <li>✓ Documents are encrypted during transfer</li>
                            <li>✓ Submission receipt will be generated</li>
                            <li>✓ Audit trail is automatically recorded</li>
                            <li>✓ Team will be notified of submission</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </div>
        </FormModal>
    );
}

/**
 * Usage Example:
 * 
 * ```tsx
 * import { ComplianceDocumentUploadModal } from '@/components/portal/modals';
 * 
 * function CompliancePage() {
 *   const [uploadOpen, setUploadOpen] = useState(false);
 * 
 *   return (
 *     <>
 *       <Button onClick={() => setUploadOpen(true)}>
 *         Upload Compliance Documents
 *       </Button>
 * 
 *       <ComplianceDocumentUploadModal
 *         open={uploadOpen}
 *         onClose={() => setUploadOpen(false)}
 *         complianceType="tax_return"
 *         dueDate={new Date('2024-12-31')}
 *         requirementId="req_123"
 *         onSuccess={() => {
 *           toast.success('Documents submitted!');
 *           refreshComplianceList();
 *         }}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
