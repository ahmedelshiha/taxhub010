/**
 * Portal Modals - Centralized exports
 * 
 * All portal modal components for easy importing
 */

// Base Components
export { BaseModal } from "./BaseModal";
export type { BaseModalProps, ProgressIndicatorProps } from "./BaseModal";

export { FormModal } from "./FormModal";
export type { FormModalProps } from "./FormModal";

// Task Modals
export { TaskDetailModal } from "./TaskDetailModal";
export type { TaskDetailModalProps } from "./TaskDetailModal";

export { TaskQuickCreateModal } from "./TaskQuickCreateModal";
export type { TaskQuickCreateModalProps } from "./TaskQuickCreateModal";

export { TaskEditModal } from "./TaskEditModal";
export type { TaskEditModalProps } from "./TaskEditModal";

export { TaskCommentModal } from "./TaskCommentModal";
export type { TaskCommentModalProps } from "./TaskCommentModal";

// Booking Modals
export { BookingCreateModal } from "./BookingCreateModal";
export type { BookingCreateModalProps } from "./BookingCreateModal";

export { BookingRescheduleModal } from "./BookingRescheduleModal";
export type { BookingRescheduleModalProps } from "./BookingRescheduleModal";

export { BookingCancelModal } from "./BookingCancelModal";
export type { BookingCancelModalProps } from "./BookingCancelModal";

// File Management Modals
export { FilePreviewModal } from "./FilePreviewModal";
export type { FilePreviewModalProps } from "./FilePreviewModal";

export { ComplianceDocumentUploadModal } from "./ComplianceDocumentUploadModal";
export type { ComplianceDocumentUploadModalProps } from "./ComplianceDocumentUploadModal";

// Calendar Modals
export { default as CalendarEventModal } from "./CalendarEventModal";
export { default as AvailabilityCheckerModal } from "./AvailabilityCheckerModal";
export { default as RecurringBookingModal } from "./RecurringBookingModal";

// Communication & Notifications Modals (Phase 5)
export { default as NotificationCenterModal } from "./NotificationCenterModal";
export { MessageComposeModal } from "./MessageComposeModal";
export { MessageThreadModal } from "./MessageThreadModal";
export { ApprovalActionModal } from "./ApprovalActionModal";
