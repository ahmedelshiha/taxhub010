"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBillUpload } from "@/lib/hooks/bills/useBillUpload";
import { Upload, Loader2 } from "lucide-react";
import { DropZone } from "@/components/portal/shared/DropZone";
import { FilePreviewCard } from "@/components/portal/shared/FilePreviewCard";
import { toast } from "sonner";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "file" | "camera";
  onUploadComplete?: () => void;
}

export function UploadModal({
  open,
  onOpenChange,
  mode,
  onUploadComplete,
}: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { upload, isUploading, progress } = useBillUpload();
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(-1);
  const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set());

  const handleFilesAccepted = (newFiles: File[]) => {
    setFiles((prev) => {
      const combined = [...prev, ...newFiles];
      // Deduplicate by name
      const unique = combined.filter((file, index, self) =>
        index === self.findIndex((f) => f.name === file.name)
      );
      return unique.slice(0, 5); // Max 5 files
    });
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setCompletedFiles((prev) => {
      const next = new Set(prev);
      next.delete(fileName);
      return next;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (completedFiles.has(file.name)) continue;

      setCurrentFileIndex(i);
      try {
        await upload(file);
        setCompletedFiles((prev) => new Set(prev).add(file.name));
      } catch (error) {
        console.error(`Failed to upload ${file.name}`, error);
        // Continue with next file? Or stop?
        // For now, we continue and let the user know which failed via toast (handled by hook?)
      }
    }

    setCurrentFileIndex(-1);
    toast.success("Upload process completed");
    onUploadComplete?.();

    // Auto close if all successful
    if (files.length > 0) {
      onOpenChange(false);
      setFiles([]);
      setCompletedFiles(new Set());
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    onOpenChange(false);
    setFiles([]);
    setCompletedFiles(new Set());
    setCurrentFileIndex(-1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "file" ? "Upload Bills" : "Take Photo"}
          </DialogTitle>
          <DialogDescription>
            {mode === "file"
              ? "Upload up to 5 bills (PDF, PNG, JPG). Max 10MB each."
              : "Camera upload is currently disabled. Please use file upload."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {mode === "file" ? (
            <>
              <DropZone
                onFilesAccepted={handleFilesAccepted}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                  'application/pdf': ['.pdf']
                }}
                maxFiles={5 - files.length}
                disabled={isUploading || files.length >= 5}
              />

              {files.length > 0 && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {files.map((file, index) => (
                    <FilePreviewCard
                      key={file.name}
                      file={file}
                      onRemove={() => handleRemoveFile(file.name)}
                      uploadProgress={index === currentFileIndex ? progress : undefined}
                      success={completedFiles.has(file.name)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Camera mode coming soon.
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading || mode === "camera"}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading {currentFileIndex + 1}/{files.length}...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length > 0 && `(${files.length})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
