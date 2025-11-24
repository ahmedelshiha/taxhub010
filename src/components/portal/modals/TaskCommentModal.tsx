/**
 * TaskCommentModal Component - Dedicated modal for adding task comments
 * 
 * Features:
 * - Rich text editor support
 * - Character count with limit
 * - @mentions support (optional)
 * - Emoji picker
 * - Comment preview
 * - Auto-save draft (localStorage)
 * - Keyboard shortcuts (Ctrl+Enter to submit)
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { FormModal } from "./FormModal";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Task } from "@/types/shared/entities/task";
import {
    MessageSquare,
    Send,
    Eye,
    SmilePlus,
    AtSign,
    Bold,
    Italic,
    List,
    type LucideIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface TaskCommentModalProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onSuccess?: () => void;
}

// Common emojis for quick selection
const QUICK_EMOJIS = ["👍", "👎", "✅", "❌", "⚠️", "📌", "🔥", "💡", "🎯", "✨"];

// Character limit for comments
const CHAR_LIMIT = 2000;

// Draft key for localStorage
const getDraftKey = (taskId: string) => `task-comment-draft-${taskId}`;

/**
 * Rich Text Toolbar Button
 */
interface ToolbarButtonProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    active?: boolean;
}

function ToolbarButton({ icon: Icon, label, onClick, active }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                active && "bg-gray-100 dark:bg-gray-700"
            )}
            title={label}
            aria-label={label}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}

/**
 * TaskCommentModal Component
 */
export function TaskCommentModal({
    open,
    onClose,
    task,
    onSuccess,
}: TaskCommentModalProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load draft from localStorage
    useEffect(() => {
        if (open && task) {
            const draftKey = getDraftKey(task.id);
            const draft = localStorage.getItem(draftKey);
            if (draft) {
                setContent(draft);
            }
        }
    }, [open, task]);

    // Save draft to localStorage
    useEffect(() => {
        if (task && content) {
            const draftKey = getDraftKey(task.id);
            localStorage.setItem(draftKey, content);
        }
    }, [content, task]);

    // Clear draft on modal close
    const handleClose = () => {
        if (task) {
            const draftKey = getDraftKey(task.id);
            localStorage.removeItem(draftKey);
        }
        setContent("");
        setActiveTab("write");
        setShowEmojiPicker(false);
        onClose();
    };

    // Handle comment submission
    const handleSubmit = async () => {
        if (!task || !content.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        if (content.length > CHAR_LIMIT) {
            toast.error(`Comment exceeds ${CHAR_LIMIT} character limit`);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiFetch(`/api/tasks/${task.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: content.trim() }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || "Failed to add comment");
            }

            toast.success("Comment added successfully");
            handleClose();
            onSuccess?.();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to add comment";
            toast.error(message);
            console.error("Comment submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Enter or Cmd+Enter to submit
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
            }
        };

        if (open) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, content, task]);

    // Insert text at cursor position
    const insertTextAtCursor = (text: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + text + content.substring(end);

        setContent(newContent);

        // Set cursor position after inserted text
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
    };

    // Text formatting functions
    const wrapSelection = (prefix: string, suffix: string = prefix) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        if (selectedText) {
            const wrappedText = `${prefix}${selectedText}${suffix}`;
            const newContent = content.substring(0, start) + wrappedText + content.substring(end);
            setContent(newContent);

            // Keep text selected
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
            }, 0);
        }
    };

    const handleBold = () => wrapSelection("**");
    const handleItalic = () => wrapSelection("*");
    const handleList = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const lineStart = content.lastIndexOf('\n', start - 1) + 1;
        const newContent = content.substring(0, lineStart) + "- " + content.substring(lineStart);
        setContent(newContent);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart + 2, lineStart + 2);
        }, 0);
    };

    const handleMention = () => {
        insertTextAtCursor("@");
        // In a real implementation, this would trigger a user search dropdown
    };

    const handleEmoji = (emoji: string) => {
        insertTextAtCursor(emoji);
        setShowEmojiPicker(false);
    };

    // Character count info
    const charCount = content.length;
    const charRemaining = CHAR_LIMIT - charCount;
    const isNearLimit = charRemaining < 200;
    const isOverLimit = charRemaining < 0;

    if (!task) return null;

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Add Comment</span>
                </div>
            }
            description={`Add a comment to task: ${task.title}`}
            size="lg"
            submitLabel="Add Comment"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isValid={content.trim().length > 0 && !isOverLimit}
        >
            <div className="space-y-4">
                {/* Tabs for Write/Preview */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="write">Write</TabsTrigger>
                        <TabsTrigger value="preview">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="write" className="space-y-3">
                        {/* Rich Text Toolbar */}
                        <div className="flex items-center gap-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                            <ToolbarButton icon={Bold} label="Bold (Ctrl+B)" onClick={handleBold} />
                            <ToolbarButton icon={Italic} label="Italic (Ctrl+I)" onClick={handleItalic} />
                            <ToolbarButton icon={List} label="Bullet List" onClick={handleList} />
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                            <ToolbarButton icon={AtSign} label="Mention User" onClick={handleMention} />
                            <div className="relative">
                                <ToolbarButton
                                    icon={SmilePlus}
                                    label="Add Emoji"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    active={showEmojiPicker}
                                />
                                {showEmojiPicker && (
                                    <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10">
                                        <div className="grid grid-cols-5 gap-1">
                                            {QUICK_EMOJIS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => handleEmoji(emoji)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Textarea */}
                        <Textarea
                            ref={textareaRef}
                            placeholder="Write your comment here... (Markdown supported)&#10;&#10;Tip: Use Ctrl+Enter to submit quickly"
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                setCursorPosition(e.target.selectionStart);
                            }}
                            onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                            rows={8}
                            className="resize-none font-mono"
                            disabled={isSubmitting}
                        />

                        {/* Character Count */}
                        <div className="flex justify-between items-center text-xs">
                            <div className="text-gray-500 dark:text-gray-400">
                                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border">
                                    Ctrl+Enter
                                </kbd>
                                <span className="ml-2">to submit</span>
                            </div>
                            <div
                                className={cn(
                                    "font-medium",
                                    isOverLimit && "text-red-600 dark:text-red-400",
                                    isNearLimit && !isOverLimit && "text-orange-600 dark:text-orange-400",
                                    !isNearLimit && "text-gray-500 dark:text-gray-400"
                                )}
                            >
                                {charCount} / {CHAR_LIMIT}
                                {isOverLimit && " (over limit)"}
                            </div>
                        </div>

                        {/* Markdown Hint */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <p className="font-medium">Markdown supported:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <span>**bold** → <strong>bold</strong></span>
                                <span>*italic* → <em>italic</em></span>
                                <span>- list → • list</span>
                                <span>@user → @mention</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="preview">
                        <div className="min-h-[200px] p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                            {content ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap">{content}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic">
                                    Nothing to preview yet. Start writing to see the preview.
                                </p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </FormModal>
    );
}

/**
 * Usage Example:
 * 
 * ```tsx
 * import { TaskCommentModal } from '@/components/portal/modals';
 * 
 * function MyComponent() {
 *   const [commentModalOpen, setCommentModalOpen] = useState(false);
 *   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
 * 
 *   return (
 *     <>
 *       <Button onClick={() => {
 *         setSelectedTask(task);
 *         setCommentModalOpen(true);
 *       }}>
 *         Add Comment
 *       </Button>
 * 
 *       <TaskCommentModal
 *         open={commentModalOpen}
 *         onClose={() => {
 *           setCommentModalOpen(false);
 *           setSelectedTask(null);
 *         }}
 *         task={selectedTask}
 *         onSuccess={() => {
 *           // Refresh task data
 *           refreshTasks();
 *         }}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
