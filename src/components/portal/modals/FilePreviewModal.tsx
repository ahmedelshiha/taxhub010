/**
 * FilePreviewModal Component - Full-screen file viewer
 * 
 * Features:
 * - Full-size image preview with zoom
 * - PDF viewer integration
 * - Zoom controls (fit, 100%, 150%, 200%)
 * - Download button
 * - Navigation (prev/next for multiple files)
 * - Keyboard shortcuts (arrows, Esc, +/-)
 * - Mobile responsive
 */

"use client";

import React, { useState, useEffect } from "react";
import { BaseModal } from "./BaseModal";
import { Button } from "@/components/ui/button";
import {
    Download,
    ZoomIn,
    ZoomOut,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    FileText,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilePreviewModalProps {
    open: boolean;
    onClose: () => void;
    files: Array<{
        id: string;
        name: string;
        url: string;
        type: string;
        size?: number;
    }>;
    initialIndex?: number;
}

type ZoomLevel = "fit" | 100 | 150 | 200;

/**
 * FilePreviewModal Component
 */
export function FilePreviewModal({
    open,
    onClose,
    files,
    initialIndex = 0,
}: FilePreviewModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("fit");

    const currentFile = files[currentIndex];
    const isImage = currentFile?.type.startsWith("image/");
    const isPDF = currentFile?.type === "application/pdf";
    const hasMultiple = files.length > 1;

    // Reset zoom when file changes
    useEffect(() => {
        setZoomLevel("fit");
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":
                    if (hasMultiple && currentIndex > 0) {
                        e.preventDefault();
                        setCurrentIndex(currentIndex - 1);
                    }
                    break;
                case "ArrowRight":
                    if (hasMultiple && currentIndex < files.length - 1) {
                        e.preventDefault();
                        setCurrentIndex(currentIndex + 1);
                    }
                    break;
                case "+":
                case "=":
                    e.preventDefault();
                    handleZoomIn();
                    break;
                case "-":
                    e.preventDefault();
                    handleZoomOut();
                    break;
                case "0":
                    e.preventDefault();
                    setZoomLevel("fit");
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, currentIndex, files.length, hasMultiple, zoomLevel]);

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < files.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleZoomIn = () => {
        const levels: ZoomLevel[] = ["fit", 100, 150, 200];
        const currentLevelIndex = levels.indexOf(zoomLevel);
        if (currentLevelIndex < levels.length - 1) {
            setZoomLevel(levels[currentLevelIndex + 1]);
        }
    };

    const handleZoomOut = () => {
        const levels: ZoomLevel[] = ["fit", 100, 150, 200];
        const currentLevelIndex = levels.indexOf(zoomLevel);
        if (currentLevelIndex > 0) {
            setZoomLevel(levels[currentLevelIndex - 1]);
        }
    };

    const handleDownload = () => {
        if (!currentFile) return;

        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = currentFile.url;
        link.download = currentFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return "";
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    const getZoomClass = () => {
        switch (zoomLevel) {
            case "fit":
                return "max-w-full max-h-full object-contain";
            case 100:
                return "w-auto h-auto";
            case 150:
                return "w-auto h-auto scale-150";
            case 200:
                return "w-auto h-auto scale-200";
        }
    };

    if (!currentFile) return null;

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title={currentFile.name}
            description={`${currentFile.type}${currentFile.size ? ` • ${formatFileSize(currentFile.size)}` : ""}`}
            size="xl"
        >
            <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                    {/* Navigation */}
                    <div className="flex items-center gap-1">
                        {hasMultiple && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                    title="Previous (←)"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                                    {currentIndex + 1} / {files.length}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={currentIndex === files.length - 1}
                                    title="Next (→)"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Zoom Controls */}
                    {isImage && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomOut}
                                disabled={zoomLevel === "fit"}
                                title="Zoom Out (-)"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-gray-600 dark:text-gray-400 px-2 min-w-[60px] text-center">
                                {zoomLevel === "fit" ? "Fit" : `${zoomLevel}%`}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomIn}
                                disabled={zoomLevel === 200}
                                title="Zoom In (+)"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setZoomLevel("fit")}
                                title="Fit to Screen (0)"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Download */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        title="Download"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                </div>

                {/* Preview Area */}
                <div className="relative min-h-[400px] max-h-[70vh] bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-auto">
                    {isImage ? (
                        <div className="p-4 flex items-center justify-center">
                            <img
                                src={currentFile.url}
                                alt={currentFile.name}
                                className={cn(
                                    "transition-transform duration-200",
                                    getZoomClass()
                                )}
                                style={{
                                    transformOrigin: "center center",
                                }}
                            />
                        </div>
                    ) : isPDF ? (
                        <div className="w-full h-full min-h-[400px] flex flex-col">
                            <iframe
                                src={currentFile.url}
                                className="w-full h-full min-h-[400px] border-0"
                                title={currentFile.name}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                                If PDF doesn&apos;t load, <button onClick={handleDownload} className="text-blue-600 hover:underline">download it here</button>
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8">
                            <FileText className="h-16 w-16 mb-4" />
                            <p className="text-lg font-medium mb-2">Preview not available</p>
                            <p className="text-sm mb-4">This file type cannot be previewed</p>
                            <Button onClick={handleDownload} size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download File
                            </Button>
                        </div>
                    )}
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-x-4">
                    {hasMultiple && (
                        <span>
                            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded border text-xs">←</kbd>
                            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded border text-xs ml-1">→</kbd>
                            {" "}Navigate
                        </span>
                    )}
                    {isImage && (
                        <span>
                            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-g ray-700 rounded border text-xs">+</kbd>
                            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded border text-xs ml-1">-</kbd>
                            {" "}Zoom
                        </span>
                    )}
                    <span>
                        <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded border text-xs">Esc</kbd>
                        {" "}Close
                    </span>
                </div>
            </div>
        </BaseModal>
    );
}

/**
 * Usage Example:
 * 
 * ```tsx
 * import { FilePreviewModal } from '@/components/portal/modals';
 * 
 * function MyComponent() {
 *   const [previewOpen, setPreviewOpen] = useState(false);
 *   const [files] = useState([
 *     { id: '1', name: 'invoice.pdf', url: '/files/invoice.pdf', type: 'application/pdf' },
 *     { id: '2', name: 'receipt.jpg', url: '/files/receipt.jpg', type: 'image/jpeg' }
 *   ]);
 * 
 *   return (
 *     <>
 *       <Button onClick={() => setPreviewOpen(true)}>
 *         View Files
 *       </Button>
 * 
 *       <FilePreviewModal
 *         open={previewOpen}
 *         onClose={() => setPreviewOpen(false)}
 *         files={files}
 *         initialIndex={0}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
